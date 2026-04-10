// Export PDF programmatique avec jsPDF + jspdf-autotable

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format, parseISO, addDays, isAfter, isBefore } from 'date-fns'
import type { RapportHebdo, Site, Photo, Avance } from '../types'
import { computeKPISite } from './engine'

// ── Constants ─────────────────────────────────────────────────────────────────
const M = 15
const PW = 210
const PH = 297
const CW = PW - 2 * M

const LM = 10
const LPW = 297
const LPH = 210
const LCW = LPW - 2 * LM

const NAVY:   [number,number,number] = [15, 35, 75]
const BLUE:   [number,number,number] = [37, 99, 235]
const BLUE2:  [number,number,number] = [59, 130, 246]
const GRAY:   [number,number,number] = [100, 116, 139]
const LGRAY:  [number,number,number] = [148, 163, 184]
const LIGHT:  [number,number,number] = [248, 250, 252]
const LIGHT2: [number,number,number] = [241, 245, 249]
const BLACK:  [number,number,number] = [15, 23, 42]
const WHITE:  [number,number,number] = [255, 255, 255]
const RED:    [number,number,number] = [220, 38, 38]
const GREEN:  [number,number,number] = [5, 150, 105]
const AMBER:  [number,number,number] = [217, 119, 6]
const TEAL:   [number,number,number] = [6, 182, 212]
const VIOLET: [number,number,number] = [124, 58, 237]
const FAR_BG: [number,number,number] = [219, 234, 254]
const FAR_FG: [number,number,number] = [29, 78, 216]
const REP_BG: [number,number,number] = [237, 233, 254]
const REP_FG: [number,number,number] = [109, 40, 217]
const GRP_BG: [number,number,number] = [30, 58, 138]

// ── Helpers ────────────────────────────────────────────────────────────────────
function n(v: number) { return new Intl.NumberFormat('fr-MA').format(Math.round(v)) }
function p(v: number) { return `${v.toFixed(1)}%` }
function t(s: string): string {
  return s
    .replace(/[éèêë]/g,'e').replace(/[ÉÈÊË]/g,'E')
    .replace(/[âàä]/g,'a').replace(/[ÂÀÄ]/g,'A')
    .replace(/[ôö]/g,'o').replace(/[ÔÖ]/g,'O')
    .replace(/[ûùü]/g,'u').replace(/[ÛÙÜ]/g,'U')
    .replace(/[îï]/g,'i').replace(/[ÎÏ]/g,'I')
    .replace(/[ç]/g,'c').replace(/[Ç]/g,'C')
}

function lastY(doc: jsPDF): number {
  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}

// ── Header / Footer ────────────────────────────────────────────────────────────
function addHeader(doc: jsPDF, dateStr: string, pw: number) {
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pw, 9, 'F')
  doc.setFillColor(...BLUE)
  doc.rect(0, 9, pw, 1.5, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('SitePilot', 8, 6.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(dateStr, pw - 8, 6.5, { align: 'right' })
}

function addFooter(doc: jsPDF, page: number, total: number, pw: number, ph: number) {
  doc.setFillColor(...NAVY)
  doc.rect(0, ph - 7, pw, 7, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...LGRAY)
  doc.text(`Page ${page} / ${total}`, pw / 2, ph - 2, { align: 'center' })
  doc.setFontSize(6)
  doc.text('SitePilot — Pilotage intelligent de chantiers', 8, ph - 2)
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
function kpiCard(
  doc: jsPDF, x: number, y: number, w: number, h: number,
  label: string, value: string, sub: string, accent: [number,number,number]
) {
  doc.setFillColor(...WHITE)
  doc.roundedRect(x, y, w, h, 2, 2, 'F')
  doc.setDrawColor(220, 230, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, w, h, 2, 2, 'S')
  doc.setFillColor(...accent)
  doc.rect(x, y, 2.5, h, 'F')

  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(label, x + 5, y + 6.5)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BLACK)
  doc.text(value, x + 5, y + 15)
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...LGRAY)
  doc.text(sub, x + 5, y + 21)
}

// ── Section title bar ──────────────────────────────────────────────────────────
function sectionBar(doc: jsPDF, x: number, y: number, w: number, title: string, sub = '') {
  doc.setFillColor(...NAVY)
  doc.roundedRect(x, y, w, 7, 1, 1, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text(title, x + 3, y + 5)
  if (sub) {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(sub, x + w - 3, y + 5, { align: 'right' })
  }
}

// ── Progress bar ───────────────────────────────────────────────────────────────
function progressBar(
  doc: jsPDF, x: number, y: number, w: number, h: number,
  pct: number, label: string, color: [number,number,number], bgColor: [number,number,number]
) {
  doc.setFillColor(...bgColor)
  doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F')
  const fillW = Math.max((w * Math.min(pct, 100)) / 100, 0.5)
  doc.setFillColor(...color)
  doc.roundedRect(x, y, fillW, h, 1.5, 1.5, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  if (pct > 20) {
    doc.setTextColor(...WHITE)
    doc.text(`${label} ${p(pct)}`, x + 3, y + h * 0.7)
  } else {
    doc.setTextColor(...color)
    doc.text(`${label} ${p(pct)}`, x + fillW + 2, y + h * 0.7)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export function exportRapportPDF(
  rapport: RapportHebdo,
  sites: Site[],
  photos: Photo[],
  avances: Avance[]
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const genDate = format(parseISO(rapport.dateGeneration), 'dd/MM/yyyy')

  const siteKPIs = new Map(
    sites.map((s) => {
      const sp = photos.filter((ph) => ph.siteId === s.id)
      return [s.id, computeKPISite(s, sp)]
    })
  )

  const riskSites = sites.filter((s) => {
    const lv = siteKPIs.get(s.id)?.alertLevel
    return lv === 'rouge' || lv === 'orange'
  })

  const genDt = parseISO(rapport.dateGeneration)
  const in30 = addDays(genDt, 30)
  const upcomingAvances = avances
    .filter((av) => { const d = parseISO(av.date); return isAfter(d, genDt) && isBefore(d, in30) })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const farSites = sites.filter((s) => s.proprietaire === 'FAR')
  const repSites = sites.filter((s) => s.proprietaire !== 'FAR')
  const budgetFAR = farSites.reduce((a, s) => a + (siteKPIs.get(s.id)?.budgetTotal ?? 0), 0)
  const budgetREP = repSites.reduce((a, s) => a + (siteKPIs.get(s.id)?.budgetTotal ?? 0), 0)
  const payeFAR = farSites.reduce((a, s) => a + (siteKPIs.get(s.id)?.totalPaye ?? 0), 0)
  const payeREP = repSites.reduce((a, s) => a + (siteKPIs.get(s.id)?.totalPaye ?? 0), 0)
  const totalBudget = rapport.kpiGlobal.budgetGlobal
  const totalPaye = rapport.kpiGlobal.totalPaye

  // ═══ PAGE 1: COVER ═══════════════════════════════════════════════════════════
  // Dark banner
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PW, 75, 'F')
  doc.setFillColor(...BLUE)
  doc.rect(0, 73, PW, 3, 'F')

  // Decorative side
  doc.setFillColor(22, 48, 95)
  doc.rect(140, 0, 70, 75, 'F')

  // Logo
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('SitePilot', M, 30)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 170, 255)
  doc.text('Pilotage intelligent de chantiers', M, 39)

  // Title
  doc.setFillColor(...BLUE)
  doc.rect(M - 1, 48, 2.5, 16, 'F')
  doc.setFontSize(17)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('RAPPORT HEBDOMADAIRE', M + 5, 58)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 190, 255)
  doc.text(t(rapport.semaine), M + 5, 66)

  // Info block
  doc.setFillColor(240, 245, 255)
  doc.roundedRect(M, 83, CW, 14, 2, 2, 'F')
  doc.setFillColor(...BLUE)
  doc.rect(M, 83, 2.5, 14, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('Periode', M + 6, 89)
  doc.text('Generation', M + CW / 2 + 6, 89)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BLACK)
  doc.text(t(rapport.semaine), M + 6, 94)
  doc.text(format(parseISO(rapport.dateGeneration), 'dd/MM/yyyy HH:mm'), M + CW / 2 + 6, 94)

  // KPI row
  const kpiList = [
    { label: 'Budget Global', value: n(totalBudget) + ' DH', sub: 'Tous les sites', accent: BLUE },
    { label: 'Total Paye', value: n(totalPaye) + ' DH', sub: p(rapport.kpiGlobal.pourcentagePaye) + ' realise', accent: GREEN },
    { label: 'Sites actifs', value: String(rapport.kpiGlobal.nbSitesEnCours), sub: `${sites.length} sites total`, accent: TEAL },
    { label: 'FAR / REP', value: `${farSites.length} / ${repSites.length}`, sub: 'Repartition', accent: VIOLET },
    { label: 'Alertes', value: String(rapport.kpiGlobal.nbAlertes), sub: rapport.kpiGlobal.nbAlertes > 0 ? 'Action requise' : 'RAS', accent: rapport.kpiGlobal.nbAlertes > 0 ? RED : GREEN },
  ]
  const cardW = (CW - 8) / kpiList.length
  kpiList.forEach((k, i) => {
    kpiCard(doc, M + i * (cardW + 2), 103, cardW, 26, k.label, k.value, k.sub, k.accent as [number,number,number])
  })

  // ── Répartition FAR/REP (stacked bar instead of donut) ──
  const repY = 140
  sectionBar(doc, M, repY, CW, 'Repartition Budget FAR / REP')

  const barY = repY + 10
  const totalB = budgetFAR + budgetREP
  const farPct = totalB > 0 ? (budgetFAR / totalB) * 100 : 50
  const farW = (CW * farPct) / 100

  // Stacked bar
  doc.setFillColor(...BLUE)
  doc.roundedRect(M, barY, farW, 10, 2, 2, 'F')
  doc.setFillColor(...VIOLET)
  doc.roundedRect(M + farW, barY, CW - farW, 10, 2, 2, 'F')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  if (farPct > 15) doc.text(`FAR ${p(farPct)}`, M + 3, barY + 7)
  if (100 - farPct > 15) doc.text(`REP ${p(100 - farPct)}`, M + farW + 3, barY + 7)

  // Labels below
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BLUE)
  doc.text(`FAR: ${n(budgetFAR)} DH`, M, barY + 16)
  doc.setTextColor(...VIOLET)
  doc.text(`REP: ${n(budgetREP)} DH`, M + CW / 2, barY + 16)
  doc.setTextColor(...GRAY)
  doc.text(`Total: ${n(totalB)} DH`, M + CW - 1, barY + 16, { align: 'right' })

  // ── Taux de réalisation ──
  const tdrY = barY + 24
  sectionBar(doc, M, tdrY, CW, 'Taux de realisation')

  const pctFAR = budgetFAR > 0 ? (payeFAR / budgetFAR) * 100 : 0
  const pctREP = budgetREP > 0 ? (payeREP / budgetREP) * 100 : 0
  const pctGlobal = totalBudget > 0 ? (totalPaye / totalBudget) * 100 : 0

  progressBar(doc, M, tdrY + 10, CW, 8, pctGlobal, 'Global', NAVY, LIGHT2)
  progressBar(doc, M, tdrY + 21, CW * 0.48, 7, pctFAR, 'FAR', BLUE, [220,230,255])
  progressBar(doc, M + CW * 0.52, tdrY + 21, CW * 0.48, 7, pctREP, 'REP', VIOLET, [235,230,255])

  // ── Budget par site (horizontal bars) ──
  const chartY = tdrY + 35
  sectionBar(doc, M, chartY, CW, 'Budget vs Paye par site')

  const details = rapport.details
  const maxB = Math.max(...details.map((d) => d.budget), 1)
  const barAreaX = M + 32
  const barAreaW = CW - 34
  const rowHeight = Math.min(7, (PH - chartY - 40) / details.length)

  details.forEach((d, i) => {
    const ry = chartY + 10 + i * rowHeight
    const site = sites.find((s) => s.id === d.siteId)

    // Label
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...BLACK)
    const lbl = t(d.siteNom).substring(0, 16)
    doc.text(lbl, M + 1, ry + rowHeight * 0.55)

    // Budget bar
    const bw = (d.budget / maxB) * barAreaW
    doc.setFillColor(200, 215, 245)
    doc.roundedRect(barAreaX, ry, bw, rowHeight * 0.4, 0.5, 0.5, 'F')

    // Payé bar
    const pw2 = (d.paye / maxB) * barAreaW
    doc.setFillColor(...GREEN)
    doc.roundedRect(barAreaX, ry + rowHeight * 0.48, pw2 > 0.3 ? pw2 : 0, rowHeight * 0.4, 0.5, 0.5, 'F')

    // Value right
    doc.setFontSize(4.5)
    doc.setTextColor(...GRAY)
    const pctStr = d.budget > 0 ? p((d.paye / d.budget) * 100) : '0%'
    doc.text(pctStr, barAreaX + bw + 1, ry + rowHeight * 0.45)
  })

  // Chart legend
  const legY = chartY + 10 + details.length * rowHeight + 2
  doc.setFillColor(200, 215, 245)
  doc.rect(M + 1, legY, 5, 2.5, 'F')
  doc.setFontSize(6)
  doc.setTextColor(...GRAY)
  doc.text('Budget', M + 8, legY + 2)
  doc.setFillColor(...GREEN)
  doc.rect(M + 26, legY, 5, 2.5, 'F')
  doc.text('Paye', M + 33, legY + 2)

  // ═══ PAGE 2: SYNTHESE ═══════════════════════════════════════════════════════
  doc.addPage()

  const p2Y = 14
  sectionBar(doc, M, p2Y, CW, 'Synthese globale — Tous les sites', genDate)

  const siteMap = new Map(sites.map((s) => [s.id, s]))
  const farDetails = rapport.details.filter((d) => siteMap.get(d.siteId)?.proprietaire === 'FAR')
  const repDetails = rapport.details.filter((d) => siteMap.get(d.siteId)?.proprietaire !== 'FAR')

  type SRow = { data: string[]; alertLevel: string; isGrp: boolean; prop: string }

  function buildSRow(d: typeof rapport.details[0]): SRow {
    const site = siteMap.get(d.siteId)
    const kpi  = siteKPIs.get(d.siteId)
    const pct  = d.budget > 0 ? (d.paye / d.budget) * 100 : 0
    return {
      data: [
        site?.code ?? d.siteId,
        site?.proprietaire ?? '',
        t(d.siteNom),
        t(site?.sousTraitant ?? ''),
        n(d.budget),
        n(d.paye),
        p(pct),
        p(d.avancementTheo),
        p(d.avancementReel),
        (d.ecart >= 0 ? '+' : '') + p(d.ecart),
      ],
      alertLevel: kpi?.alertLevel ?? 'vert',
      isGrp: false,
      prop: site?.proprietaire ?? '',
    }
  }

  const sRows: SRow[] = [
    { data: ['FAR — Forces Armees Royales', ...Array(9).fill('')], alertLevel: 'vert', isGrp: true, prop: '' },
    ...farDetails.map(buildSRow),
    { data: ['REP — Propriete Republique', ...Array(9).fill('')], alertLevel: 'vert', isGrp: true, prop: '' },
    ...repDetails.map(buildSRow),
  ]

  // Total row
  const totB = rapport.details.reduce((a, d) => a + d.budget, 0)
  const totP = rapport.details.reduce((a, d) => a + d.paye, 0)
  const totPct2 = totB > 0 ? (totP / totB) * 100 : 0
  sRows.push({ data: ['TOTAL', '', '', '', n(totB), n(totP), p(totPct2), '', '', ''], alertLevel: 'vert', isGrp: false, prop: 'TOTAL' })

  // Portrait A4: available = 210 - 2*15 = 180mm
  autoTable(doc, {
    startY: p2Y + 10,
    tableWidth: 'wrap',
    head: [['Code', 'Prop.', 'Site', 'S/Trait.', 'Budget', 'Paye', '%Paye', 'Av.T', 'Av.R', 'Ecart']],
    body: sRows.map((r) => r.data),
    styles: { fontSize: 6.5, cellPadding: 1.5, lineColor: [220,230,240], lineWidth: 0.1, overflow: 'ellipsize' },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 7, cellPadding: 1.5 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 10 },
      2: { cellWidth: 30 },
      3: { cellWidth: 16 },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 14, halign: 'center' },
      7: { cellWidth: 14, halign: 'center' },
      8: { cellWidth: 14, halign: 'center' },
      9: { cellWidth: 14, halign: 'center' },
    },
    willDrawCell: (data) => {
      if (data.section !== 'body') return
      const row = sRows[data.row.index]
      if (!row) return
      if (row.isGrp) {
        data.cell.styles.fillColor = GRP_BG
        data.cell.styles.textColor = WHITE
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 7.5
        return
      }
      if (row.prop === 'TOTAL') {
        data.cell.styles.fillColor = LIGHT2
        data.cell.styles.textColor = NAVY
        data.cell.styles.fontStyle = 'bold'
        return
      }
      if (data.column.index === 1) {
        if (row.prop === 'FAR') { data.cell.styles.fillColor = FAR_BG; data.cell.styles.textColor = FAR_FG; data.cell.styles.fontStyle = 'bold' }
        else if (row.prop === 'REP') { data.cell.styles.fillColor = REP_BG; data.cell.styles.textColor = REP_FG; data.cell.styles.fontStyle = 'bold' }
      }
      if (data.column.index === 9) {
        if (row.alertLevel === 'rouge') { data.cell.styles.fillColor = [254,226,226]; data.cell.styles.textColor = [185,28,28]; data.cell.styles.fontStyle = 'bold' }
        else if (row.alertLevel === 'orange') { data.cell.styles.fillColor = [255,237,213]; data.cell.styles.textColor = [180,83,9]; data.cell.styles.fontStyle = 'bold' }
        else if (row.prop !== 'TOTAL') { data.cell.styles.textColor = [4,120,87] }
      }
    },
    margin: { left: M, right: M },
  })

  // ═══ PAGE 3: BUDGET PAR POSTE (Landscape) ═════════════════════════════════
  doc.addPage()

  sectionBar(doc, M, p2Y, CW, 'Repartition budgetaire par poste', 'Montants en DH')

  const sortedSites = [...farSites, ...repSites]

  type PRow = { data: string[]; isGrp: boolean; prop: string }

  function fmtBP(b: number, py: number) {
    if (b === 0 && py === 0) return String.fromCharCode(8212) // em dash
    return `${b > 0 ? n(b) : String.fromCharCode(8212)} / ${py > 0 ? n(py) : String.fromCharCode(8212)}`
  }

  function buildPRow(site: Site): PRow {
    const kpi = siteKPIs.get(site.id)
    return {
      data: [
        site.code, site.proprietaire, t(site.nom),
        fmtBP(site.budget.pylone, site.paiements.pylone),
        fmtBP(site.budget.local, site.paiements.local),
        fmtBP(site.budget.localGE, site.paiements.localGE),
        site.budget.murCloture > 0 ? n(site.budget.murCloture) : String.fromCharCode(8212),
        site.budget.electricite > 0 ? n(site.budget.electricite) : String.fromCharCode(8212),
        site.budget.fraisExtra > 0 ? n(site.budget.fraisExtra) : String.fromCharCode(8212),
        fmtBP(kpi?.budgetTotal ?? 0, kpi?.totalPaye ?? 0),
      ],
      isGrp: false, prop: site.proprietaire,
    }
  }

  const pRows: PRow[] = [
    { data: ['FAR — Forces Armees Royales', ...Array(9).fill('')], isGrp: true, prop: '' },
    ...farSites.map(buildPRow),
    { data: ['REP — Propriete Republique', ...Array(9).fill('')], isGrp: true, prop: '' },
    ...repSites.map(buildPRow),
  ]

  // Totals
  const tPyl = [sites.reduce((a,s)=>a+s.budget.pylone,0), sites.reduce((a,s)=>a+s.paiements.pylone,0)]
  const tLoc = [sites.reduce((a,s)=>a+s.budget.local,0), sites.reduce((a,s)=>a+s.paiements.local,0)]
  const tGE  = [sites.reduce((a,s)=>a+s.budget.localGE,0), sites.reduce((a,s)=>a+s.paiements.localGE,0)]
  const tMur = sites.reduce((a,s)=>a+s.budget.murCloture,0)
  const tElec = sites.reduce((a,s)=>a+s.budget.electricite,0)
  const tExt = sites.reduce((a,s)=>a+s.budget.fraisExtra,0)
  const tAll = [sites.reduce((a,s)=>a+(siteKPIs.get(s.id)?.budgetTotal??0),0), sites.reduce((a,s)=>a+(siteKPIs.get(s.id)?.totalPaye??0),0)]

  pRows.push({
    data: ['TOTAL','','', `${n(tPyl[0])} / ${n(tPyl[1])}`, `${n(tLoc[0])} / ${n(tLoc[1])}`, `${n(tGE[0])} / ${n(tGE[1])}`, n(tMur), n(tElec), n(tExt), `${n(tAll[0])} / ${n(tAll[1])}`],
    isGrp: false, prop: 'TOTAL',
  })

  autoTable(doc, {
    startY: p2Y + 10,
    tableWidth: 'wrap',
    head: [['Code','Prop.','Site','Pylone','Local','GE','Clot.','Elec.','Extra','Total']],
    body: pRows.map((r) => r.data),
    styles: { fontSize: 6, cellPadding: 1.5, lineColor: [220,230,240], lineWidth: 0.1, overflow: 'ellipsize' },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 6.5, cellPadding: 1.5 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 13 },
      1: { cellWidth: 9 },
      2: { cellWidth: 22 },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 15, halign: 'right' },
      7: { cellWidth: 15, halign: 'right' },
      8: { cellWidth: 15, halign: 'right' },
      9: { cellWidth: 22, halign: 'right' },
    },
    willDrawCell: (data) => {
      if (data.section !== 'body') return
      const row = pRows[data.row.index]
      if (!row) return
      if (row.isGrp) {
        data.cell.styles.fillColor = GRP_BG; data.cell.styles.textColor = WHITE
        data.cell.styles.fontStyle = 'bold'; data.cell.styles.fontSize = 7
        return
      }
      if (row.prop === 'TOTAL') {
        data.cell.styles.fillColor = NAVY; data.cell.styles.textColor = WHITE
        data.cell.styles.fontStyle = 'bold'; data.cell.styles.fontSize = 7
        return
      }
      if (data.column.index === 1) {
        if (row.prop === 'FAR') { data.cell.styles.fillColor = FAR_BG; data.cell.styles.textColor = FAR_FG; data.cell.styles.fontStyle = 'bold' }
        else if (row.prop === 'REP') { data.cell.styles.fillColor = REP_BG; data.cell.styles.textColor = REP_FG; data.cell.styles.fontStyle = 'bold' }
      }
      if (data.column.index === 9 && row.prop !== 'TOTAL') {
        data.cell.styles.fontStyle = 'bold'; data.cell.styles.textColor = NAVY
      }
    },
    margin: { left: M, right: M },
  })

  // Note
  doc.setFontSize(6)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...LGRAY)
  doc.text('B/P = Budget / Paye en DH', M, lastY(doc) + 4)

  // ═══ PAGE 4: SITES A RISQUE ═══════════════════════════════════════════════
  if (riskSites.length > 0) {
    doc.addPage()

    sectionBar(doc, M, 14, CW, 'Sites necessitant attention', `${riskSites.length} site(s)`)

    let y = 26

    for (const site of riskSites) {
      const kpi = siteKPIs.get(site.id)!
      const detail = rapport.details.find((d) => d.siteId === site.id)
      if (y > 240) { doc.addPage(); y = 16 }

      const accent: [number,number,number] = kpi.alertLevel === 'rouge' ? RED : AMBER

      // Card background
      doc.setFillColor(...LIGHT)
      doc.roundedRect(M, y, CW, 44, 2, 2, 'F')
      doc.setFillColor(...accent)
      doc.rect(M, y, 3, 44, 'F')
      doc.setDrawColor(...accent)
      doc.setLineWidth(0.3)
      doc.roundedRect(M, y, CW, 44, 2, 2, 'S')

      // Badge
      doc.setFillColor(...accent)
      doc.roundedRect(PW - M - 22, y + 3, 20, 6, 1, 1, 'F')
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...WHITE)
      doc.text(kpi.alertLevel.toUpperCase(), PW - M - 12, y + 7.5, { align: 'center' })

      // Title
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...BLACK)
      doc.text(`${site.code} — ${t(site.nom)}`, M + 6, y + 8)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...GRAY)
      doc.text(`${site.proprietaire} · ${t(site.sousTraitant ?? '')}`, M + 6, y + 13)

      // Metrics row
      const metrics = [
        { l: 'Budget', v: n(kpi.budgetTotal) + ' DH', c: BLUE },
        { l: 'Paye', v: n(kpi.totalPaye) + ' DH', c: GREEN },
        { l: 'Reste', v: n(kpi.resteAPayer) + ' DH', c: RED },
        { l: 'Av. reel', v: p(kpi.avancementReel), c: AMBER },
        { l: 'Av. theo', v: p(kpi.avancementTheorique), c: TEAL },
        { l: 'Ecart', v: (kpi.ecartAvancement >= 0 ? '+' : '') + p(kpi.ecartAvancement), c: accent },
      ]
      const mw = (CW - 14) / 6
      metrics.forEach((m, i) => {
        const mx = M + 6 + i * (mw + 1)
        doc.setFillColor(...WHITE)
        doc.roundedRect(mx, y + 16, mw, 13, 1, 1, 'F')
        doc.setFillColor(...m.c)
        doc.rect(mx, y + 16, mw, 1.5, 'F')
        doc.setFontSize(5.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...GRAY)
        doc.text(m.l, mx + mw / 2, y + 21.5, { align: 'center' })
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...m.c)
        doc.text(m.v, mx + mw / 2, y + 26.5, { align: 'center' })
      })

      // Progress
      const pctPaye = kpi.budgetTotal > 0 ? (kpi.totalPaye / kpi.budgetTotal) * 100 : 0
      doc.setFillColor(220, 230, 245)
      doc.roundedRect(M + 6, y + 33, CW - 12, 4, 1, 1, 'F')
      doc.setFillColor(...GREEN)
      doc.roundedRect(M + 6, y + 33, ((CW - 12) * pctPaye) / 100, 4, 1, 1, 'F')
      doc.setFontSize(5.5)
      doc.setTextColor(...GRAY)
      doc.text(`${p(pctPaye)} paye`, M + 6, y + 41)
      if (detail?.recommandation) {
        doc.setFont('helvetica', 'italic')
        doc.text(`> ${t(detail.recommandation)}`, M + 30, y + 41)
      }

      y += 50
    }
  }

  // ═══ LAST PAGE: PLANNING ═══════════════════════════════════════════════════
  doc.addPage()

  sectionBar(doc, M, 14, CW, 'Prochaines echeances — 30 jours', genDate)

  if (upcomingAvances.length === 0) {
    doc.setFillColor(...LIGHT)
    doc.roundedRect(M, 26, CW, 16, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...LGRAY)
    doc.text('Aucune echeance dans les 30 prochains jours.', PW / 2, 36, { align: 'center' })
  } else {
    autoTable(doc, {
      startY: 26,
      tableWidth: 'wrap',
      head: [['Date', 'Type', 'Sites concernes', 'Montant DH']],
      body: upcomingAvances.map((av) => [
        format(parseISO(av.date), 'dd/MM/yyyy'),
        t(av.type),
        av.sitesNoms.map(t).join(', '),
        n(av.montant),
      ]),
      styles: { fontSize: 8, cellPadding: 2.5, lineColor: [220,230,240], lineWidth: 0.1, overflow: 'ellipsize' },
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', cellPadding: 2.5 },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 75 },
        3: { cellWidth: 28, halign: 'right', fontStyle: 'bold', textColor: BLUE },
      },
      margin: { left: M, right: M },
    })

    // Total
    const planTotal = upcomingAvances.reduce((a, av) => a + av.montant, 0)
    const fy = lastY(doc)
    doc.setFillColor(...NAVY)
    doc.roundedRect(M, fy + 2, CW, 9, 2, 2, 'F')
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text('Total echeances 30 jours', M + 4, fy + 8)
    doc.text(n(planTotal) + ' DH', PW - M - 4, fy + 8, { align: 'right' })
  }

  // ═══ HEADERS & FOOTERS ═══════════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const pw = (doc.internal.pageSize as { width: number }).width
    const ph = (doc.internal.pageSize as { height: number }).height
    if (i > 1) addHeader(doc, genDate, pw)
    addFooter(doc, i, totalPages, pw, ph)
  }

  doc.save(`SitePilot_Rapport_${format(parseISO(rapport.dateGeneration), 'yyyy-MM-dd')}.pdf`)
}
