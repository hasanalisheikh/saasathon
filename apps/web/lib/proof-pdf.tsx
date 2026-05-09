import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Request, Project, Profile, AITask } from '@/types'

const ACCENT = '#171717'
const GREEN = '#10b981'
const RED = '#ef4444'
const BLUE = '#3b82f6'
const TEXT_PRIMARY = '#111827'
const TEXT_SECONDARY = '#6b7280'
const BORDER = '#e5e7eb'
const SURFACE = '#f9fafb'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT_PRIMARY,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    lineHeight: 1.5,
  },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  brand: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: ACCENT, letterSpacing: 0 },
  headerRight: { alignItems: 'flex-end' },
  docTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: TEXT_PRIMARY },
  docSubtitle: { fontSize: 8, color: TEXT_SECONDARY, marginTop: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 20 },
  // Meta grid
  metaGrid: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  metaValue: { fontSize: 9, color: TEXT_PRIMARY },
  // Sections
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  body: { fontSize: 9, color: TEXT_PRIMARY, lineHeight: 1.6 },
  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 10 },
  badgeText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  // Evidence
  evidenceItem: { flexDirection: 'row', marginBottom: 4 },
  bullet: { width: 12, color: ACCENT, fontSize: 9 },
  evidenceText: { flex: 1, fontSize: 9, color: TEXT_SECONDARY, lineHeight: 1.5 },
  // Tasks table
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: SURFACE, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 3, marginBottom: 2 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
  colTask: { flex: 3 },
  colHours: { flex: 1, textAlign: 'right' },
  tableHeaderText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: TEXT_SECONDARY, textTransform: 'uppercase' },
  tableCell: { fontSize: 9, color: TEXT_PRIMARY },
  tableCellSub: { fontSize: 8, color: TEXT_SECONDARY, marginTop: 1 },
  // Cost box
  costBox: { backgroundColor: SURFACE, borderRadius: 4, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costLabel: { fontSize: 8, color: TEXT_SECONDARY, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  costValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: ACCENT },
  costSub: { fontSize: 8, color: TEXT_SECONDARY, marginTop: 2 },
  // Approval record
  approvalBox: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 4, padding: 16 },
  approvalRow: { flexDirection: 'row', marginBottom: 6 },
  approvalKey: { width: 120, fontSize: 8, fontFamily: 'Helvetica-Bold', color: TEXT_SECONDARY, textTransform: 'uppercase' },
  approvalVal: { flex: 1, fontSize: 9, color: TEXT_PRIMARY },
  // GitHub
  githubBox: { backgroundColor: SURFACE, borderRadius: 4, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  // Footer
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7, color: TEXT_SECONDARY },
  footerBrand: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: ACCENT },
})

function classificationBadgeColor(c: string | null): string {
  switch (c) {
    case 'in_scope': return GREEN
    case 'out_of_scope': return RED
    case 'ambiguous': return ACCENT
    case 'clarification_needed': return BLUE
    default: return TEXT_SECONDARY
  }
}

function classificationLabel(c: string | null): string {
  switch (c) {
    case 'in_scope': return 'IN SCOPE'
    case 'out_of_scope': return 'OUT OF SCOPE'
    case 'ambiguous': return 'AMBIGUOUS'
    case 'clarification_needed': return 'CLARIFY'
    default: return 'UNCLASSIFIED'
  }
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
}

interface ProofPackDocumentProps {
  request: Request
  project: Pick<Project, 'id' | 'name' | 'client_name' | 'client_email' | 'hourly_rate'>
  developerName: string
  developerEmail: string
}

export function ProofPackDocument({ request, project, developerName, developerEmail }: ProofPackDocumentProps) {
  const tasks = request.tasks ?? []
  const totalMinHours = tasks.reduce((sum, t) => sum + t.min_hours, 0)
  const totalMaxHours = tasks.reduce((sum, t) => sum + t.max_hours, 0)

  return (
    <Document
      title={`Scope Change Approval – ${project.name}`}
      author="Monad"
      subject="Scope change approval record"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.brand}>MONAD</Text>
          <View style={s.headerRight}>
            <Text style={s.docTitle}>Scope Change Approval Record</Text>
            <Text style={s.docSubtitle}>Ref: {request.id.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>
        <View style={s.divider} />

        {/* Meta grid */}
        <View style={s.metaGrid}>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Project</Text>
            <Text style={s.metaValue}>{project.name}</Text>
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Client</Text>
            <Text style={s.metaValue}>{project.client_name}</Text>
            {project.client_email && <Text style={[s.metaValue, { color: TEXT_SECONDARY }]}>{project.client_email}</Text>}
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Developer</Text>
            <Text style={s.metaValue}>{developerName}</Text>
            <Text style={[s.metaValue, { color: TEXT_SECONDARY }]}>{developerEmail}</Text>
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Request Received</Text>
            <Text style={s.metaValue}>{formatDate(request.created_at)}</Text>
          </View>
        </View>

        {/* Client Request */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Client Request</Text>
          {request.raw_email_subject && (
            <Text style={[s.body, { fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>
              {request.raw_email_subject}
            </Text>
          )}
          {request.raw_email_from && (
            <Text style={[s.body, { color: TEXT_SECONDARY, marginBottom: 8 }]}>
              From: {request.raw_email_from}
            </Text>
          )}
          <Text style={s.body}>{request.raw_email_body}</Text>
        </View>

        {/* AI Analysis */}
        {request.classification && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>AI Scope Analysis</Text>
            <View style={[s.badge, { backgroundColor: classificationBadgeColor(request.classification) }]}>
              <Text style={s.badgeText}>{classificationLabel(request.classification)}</Text>
            </View>
            {request.confidence != null && (
              <Text style={[s.body, { color: TEXT_SECONDARY, marginBottom: 8 }]}>
                Confidence: {Math.round(request.confidence * 100)}%
                {request.risk_level && `  ·  Risk: ${request.risk_level.charAt(0).toUpperCase() + request.risk_level.slice(1)}`}
              </Text>
            )}
            {request.scope_evidence.length > 0 && (
              <>
                <Text style={[s.metaLabel, { marginBottom: 6 }]}>Scope Evidence</Text>
                {request.scope_evidence.map((e, i) => (
                  <View key={i} style={s.evidenceItem}>
                    <Text style={s.bullet}>›</Text>
                    <Text style={s.evidenceText}>{e}</Text>
                  </View>
                ))}
              </>
            )}
            {request.technical_breakdown && (
              <>
                <Text style={[s.metaLabel, { marginTop: 10, marginBottom: 6 }]}>Technical Breakdown</Text>
                <Text style={s.body}>{request.technical_breakdown}</Text>
              </>
            )}
          </View>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Task Breakdown</Text>
            <View style={s.table}>
              <View style={s.tableHeader}>
                <View style={s.colTask}><Text style={s.tableHeaderText}>Task</Text></View>
                <View style={s.colHours}><Text style={s.tableHeaderText}>Hours</Text></View>
              </View>
              {tasks.map((t, i) => (
                <View key={i} style={s.tableRow}>
                  <View style={s.colTask}>
                    <Text style={s.tableCell}>{t.name}</Text>
                    {t.description && <Text style={s.tableCellSub}>{t.description}</Text>}
                  </View>
                  <View style={s.colHours}>
                    <Text style={s.tableCell}>{t.min_hours}–{t.max_hours}h</Text>
                  </View>
                </View>
              ))}
              <View style={[s.tableRow, { borderBottomWidth: 0, paddingTop: 8 }]}>
                <View style={s.colTask}><Text style={[s.tableCell, { fontFamily: 'Helvetica-Bold' }]}>Total</Text></View>
                <View style={s.colHours}><Text style={[s.tableCell, { fontFamily: 'Helvetica-Bold' }]}>{totalMinHours}–{totalMaxHours}h</Text></View>
              </View>
            </View>
          </View>
        )}

        {/* Financial Summary */}
        {(request.cost_min != null && request.cost_max != null) && (
          <View style={[s.section, { marginBottom: 24 }]}>
            <Text style={s.sectionTitle}>Financial Summary</Text>
            <View style={s.costBox}>
              <View>
                <Text style={s.costLabel}>Agreed Cost Range</Text>
                <Text style={s.costValue}>{formatCurrency(request.cost_min)} – {formatCurrency(request.cost_max)}</Text>
                {request.effort_min_hours != null && (
                  <Text style={s.costSub}>
                    {request.effort_min_hours}–{request.effort_max_hours} hours
                    {project.hourly_rate ? ` @ ${formatCurrency(project.hourly_rate)}/hr` : ''}
                  </Text>
                )}
              </View>
              {request.timeline_impact_days != null && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.costLabel}>Timeline Impact</Text>
                  <Text style={[s.costValue, { fontSize: 14 }]}>{request.timeline_impact_days}d</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Approval Record */}
        {request.approved_at && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Approval Record</Text>
            <View style={s.approvalBox}>
              <View style={s.approvalRow}>
                <Text style={s.approvalKey}>Status</Text>
                <Text style={[s.approvalVal, { color: GREEN, fontFamily: 'Helvetica-Bold' }]}>APPROVED</Text>
              </View>
              <View style={s.approvalRow}>
                <Text style={s.approvalKey}>Approved At</Text>
                <Text style={s.approvalVal}>{formatDate(request.approved_at)}</Text>
              </View>
              {request.approved_ip && (
                <View style={s.approvalRow}>
                  <Text style={s.approvalKey}>Client IP</Text>
                  <Text style={s.approvalVal}>{request.approved_ip}</Text>
                </View>
              )}
              <View style={s.approvalRow}>
                <Text style={s.approvalKey}>Client Understood Cost</Text>
                <Text style={s.approvalVal}>{request.client_understood_cost ? 'Yes — client confirmed cost understanding' : 'Not explicitly confirmed'}</Text>
              </View>
              <View style={[s.approvalRow, { marginBottom: 0 }]}>
                <Text style={s.approvalKey}>Approval Token</Text>
                <Text style={[s.approvalVal, { fontFamily: 'Helvetica-Bold', fontSize: 8, letterSpacing: 1 }]}>
                  {request.approval_token.slice(-12).toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {request.declined_at && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Approval Record</Text>
            <View style={[s.approvalBox, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
              <View style={s.approvalRow}>
                <Text style={s.approvalKey}>Status</Text>
                <Text style={[s.approvalVal, { color: RED, fontFamily: 'Helvetica-Bold' }]}>DECLINED</Text>
              </View>
              <View style={[s.approvalRow, { marginBottom: 0 }]}>
                <Text style={s.approvalKey}>Declined At</Text>
                <Text style={s.approvalVal}>{formatDate(request.declined_at)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* GitHub Issue */}
        {request.github_issue_url && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>GitHub Issue</Text>
            <View style={s.githubBox}>
              <View>
                <Text style={s.body}>Issue #{request.github_issue_number}</Text>
                <Text style={[s.body, { color: TEXT_SECONDARY, marginTop: 2 }]}>Created automatically on approval</Text>
              </View>
              <Link src={request.github_issue_url} style={{ fontSize: 8, color: ACCENT }}>
                {request.github_issue_url}
              </Link>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Generated {formatDate(new Date().toISOString())}  ·  ID: {request.id}</Text>
          <Text style={s.footerBrand}>MONAD</Text>
        </View>
      </Page>
    </Document>
  )
}
