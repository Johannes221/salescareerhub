import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@salescareerhub.de' },
    update: {},
    create: {
      firebaseUid: 'admin-firebase-uid-placeholder',
      email: 'admin@salescareerhub.de',
      role: 'admin',
      displayName: 'Admin',
      isActive: true,
      onboardingCompleted: true,
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // ─── Candidate Users ──────────────────────────────────────
  const candidateUsers = [];
  const candidateData = [
    { email: 'kandidat1@demo.de', name: 'Max Mustermann', uid: 'candidate-1-uid' },
    { email: 'kandidat2@demo.de', name: 'Anna Schmidt', uid: 'candidate-2-uid' },
    { email: 'kandidat3@demo.de', name: 'Lukas Weber', uid: 'candidate-3-uid' },
  ];

  for (const c of candidateData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        firebaseUid: c.uid,
        email: c.email,
        role: 'candidate',
        displayName: c.name,
        isActive: true,
        onboardingCompleted: true,
      },
    });
    candidateUsers.push(user);
  }
  console.log('✅ Candidate users created');

  // ─── Candidate Profiles ───────────────────────────────────
  const profiles = [
    {
      userId: candidateUsers[0].id,
      firstName: 'Max', lastName: 'Mustermann', email: 'kandidat1@demo.de',
      location: 'München', country: 'Deutschland', currentRole: 'Account Executive',
      targetRole: 'Enterprise AE', seniority: 'senior', yearsOfExperience: 5,
      languages: ['Deutsch', 'Englisch'], skills: ['SaaS', 'Enterprise Sales', 'MEDDIC', 'Salesforce'],
      salaryExpectationBase: 85000, salaryExpectationOte: 160000,
      shortBio: 'Erfahrener AE mit Fokus auf Enterprise SaaS im DACH-Raum.',
      visibleToRecruiters: true, openToWork: true, noticePeriod: '3 Monate',
    },
    {
      userId: candidateUsers[1].id,
      firstName: 'Anna', lastName: 'Schmidt', email: 'kandidat2@demo.de',
      location: 'Berlin', country: 'Deutschland', currentRole: 'SDR',
      targetRole: 'Account Executive', seniority: 'mid', yearsOfExperience: 2,
      languages: ['Deutsch', 'Englisch', 'Französisch'], skills: ['Outbound', 'Cold Calling', 'HubSpot', 'LinkedIn Sales Navigator'],
      salaryExpectationBase: 55000, salaryExpectationOte: 90000,
      shortBio: 'Ambitionierte SDR auf dem Weg zur AE-Rolle.',
      visibleToRecruiters: true, openToWork: true, noticePeriod: '1 Monat',
    },
    {
      userId: candidateUsers[2].id,
      firstName: 'Lukas', lastName: 'Weber', email: 'kandidat3@demo.de',
      location: 'Zürich', country: 'Schweiz', currentRole: 'Sales Manager',
      targetRole: 'Head of Sales', seniority: 'lead', yearsOfExperience: 8,
      languages: ['Deutsch', 'Englisch'], skills: ['Team Leadership', 'Pipeline Management', 'Strategic Selling', 'Revenue Operations'],
      salaryExpectationBase: 130000, salaryExpectationOte: 220000,
      shortBio: 'Sales Leader mit Track Record im SaaS-Bereich.',
      visibleToRecruiters: false, openToWork: true, noticePeriod: '3 Monate',
    },
  ];

  for (const p of profiles) {
    await prisma.candidateProfile.upsert({
      where: { userId: p.userId },
      update: {},
      create: p,
    });
  }
  console.log('✅ Candidate profiles created');

  // ─── Company Users & Companies ────────────────────────────
  const companyData = [
    {
      user: { email: 'company1@demo.de', name: 'TechCorp Admin', uid: 'company-1-uid' },
      company: {
        name: 'TechCorp GmbH', slug: 'techcorp-gmbh', country: 'Deutschland', city: 'München',
        employeeCount: '201-500', fundingStage: 'series-b', industry: 'Enterprise SaaS',
        description: 'TechCorp entwickelt Enterprise-Software für die digitale Transformation. Unser Sales-Team ist eines der stärksten im DACH-Raum.',
        benefits: ['Remote-First', 'Equity', 'Learning Budget', 'Team Events', 'Moderne Ausstattung'],
        remotePolicy: 'hybrid', salesTeamSize: '25-50', website: 'https://techcorp.example.de',
        isVerified: true, isFeatured: true, tags: ['Enterprise', 'SaaS', 'B2B'],
      },
    },
    {
      user: { email: 'company2@demo.de', name: 'CloudScale Admin', uid: 'company-2-uid' },
      company: {
        name: 'CloudScale AG', slug: 'cloudscale-ag', country: 'Deutschland', city: 'Berlin',
        employeeCount: '51-200', fundingStage: 'series-a', industry: 'Cloud Infrastructure',
        description: 'CloudScale bietet skalierbare Cloud-Lösungen für den Mittelstand. Wachstumsstarkes Team mit ambitionierten Zielen.',
        benefits: ['100% Remote', 'Flexible Arbeitszeiten', 'Weiterbildung', 'Fitness-Zuschuss'],
        remotePolicy: 'remote', salesTeamSize: '10-25', website: 'https://cloudscale.example.de',
        isVerified: true, isFeatured: false, tags: ['Cloud', 'Infrastructure', 'SMB'],
      },
    },
    {
      user: { email: 'company3@demo.de', name: 'DataFlow Admin', uid: 'company-3-uid' },
      company: {
        name: 'DataFlow Solutions', slug: 'dataflow-solutions', country: 'Schweiz', city: 'Zürich',
        employeeCount: '501-1000', fundingStage: 'series-c', industry: 'Data & Analytics',
        description: 'DataFlow ist der führende Anbieter für Daten-Analytics im DACH-Raum. International aufgestellt mit starkem lokalem Team.',
        benefits: ['Attraktives Gehalt', 'Bonus', 'Aktienoptionen', 'International'],
        remotePolicy: 'hybrid', salesTeamSize: '50+', website: 'https://dataflow.example.ch',
        isVerified: true, isFeatured: true, tags: ['Data', 'Analytics', 'Enterprise'],
      },
    },
  ];

  const companies = [];
  for (const cd of companyData) {
    const user = await prisma.user.upsert({
      where: { email: cd.user.email },
      update: {},
      create: {
        firebaseUid: cd.user.uid,
        email: cd.user.email,
        role: 'company',
        displayName: cd.user.name,
        isActive: true,
        onboardingCompleted: true,
      },
    });
    const company = await prisma.company.upsert({
      where: { userId: user.id },
      update: {},
      create: { ...cd.company, userId: user.id },
    });
    companies.push(company);
  }
  console.log('✅ Companies created');

  // ─── Jobs ─────────────────────────────────────────────────
  const jobsData = [
    { companyIdx: 0, title: 'Enterprise Account Executive – DACH', slug: 'enterprise-ae-dach-techcorp', roleCategory: 'Enterprise AE', seniority: 'senior', location: 'München', country: 'Deutschland', remoteType: 'hybrid', salaryMin: 80000, salaryMax: 120000, oteMin: 140000, oteMax: 200000, description: 'Als Enterprise AE verantwortest du den gesamten Sales-Cycle für unsere Enterprise-Kunden im DACH-Raum. Du arbeitest eng mit dem Pre-Sales und Customer Success zusammen.', requirements: 'Mindestens 4 Jahre Erfahrung im Enterprise SaaS Sales. Nachweisbare Quota-Erreichung. Fließend Deutsch und Englisch.', isFeatured: true, isAgencyManaged: false, sourceType: 'direct_company_posting', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 0, title: 'SDR – Outbound DACH', slug: 'sdr-outbound-techcorp', roleCategory: 'SDR', seniority: 'junior', location: 'München', country: 'Deutschland', remoteType: 'hybrid', salaryMin: 42000, salaryMax: 50000, oteMin: 60000, oteMax: 72000, description: 'Du bist der erste Kontaktpunkt für unsere potenziellen Enterprise-Kunden. Aufbau und Qualifizierung der Pipeline für unser AE-Team.', requirements: 'Erste Erfahrung im B2B Sales oder Vertrieb. Hohe Kommunikationsstärke. Deutsch auf Muttersprachniveau.', isFeatured: false, isAgencyManaged: false, sourceType: 'direct_company_posting', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 0, title: 'Sales Manager – Enterprise Team', slug: 'sales-manager-enterprise-techcorp', roleCategory: 'Sales Manager', seniority: 'lead', location: 'München', country: 'Deutschland', remoteType: 'hybrid', salaryMin: 95000, salaryMax: 120000, oteMin: 160000, oteMax: 210000, description: 'Führung und Skalierung unseres Enterprise Sales Teams. Verantwortung für Quota, Pipeline und Teamaufbau.', requirements: '6+ Jahre Sales Erfahrung, davon mindestens 2 in einer Führungsrolle. Enterprise SaaS Background.', isFeatured: true, isAgencyManaged: true, sourceType: 'agency_managed_job', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 1, title: 'Account Executive – Mid-Market', slug: 'ae-midmarket-cloudscale', roleCategory: 'Mid-Market AE', seniority: 'mid', location: 'Berlin', country: 'Deutschland', remoteType: 'remote', salaryMin: 60000, salaryMax: 80000, oteMin: 100000, oteMax: 140000, description: 'Betreuung und Ausbau unserer Mid-Market Kunden. Full-Cycle Sales von der Demo bis zum Abschluss.', requirements: '2-4 Jahre B2B SaaS Sales Erfahrung. Cloud/IT Affinität. Remote-Erfahrung.', isFeatured: false, isAgencyManaged: false, sourceType: 'direct_company_posting', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 1, title: 'BDR – DACH Region', slug: 'bdr-dach-cloudscale', roleCategory: 'BDR', seniority: 'junior', location: 'Berlin', country: 'Deutschland', remoteType: 'remote', salaryMin: 40000, salaryMax: 48000, oteMin: 58000, oteMax: 70000, description: 'Business Development für die DACH Region. Identifikation und Ansprache von Zielkunden.', requirements: 'Motivation und Lernbereitschaft. Erste Sales-Erfahrung von Vorteil. Deutsch und Englisch.', isFeatured: false, isAgencyManaged: false, sourceType: 'direct_company_posting', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 1, title: 'Revenue Operations Manager', slug: 'revops-cloudscale', roleCategory: 'Revenue Operations', seniority: 'senior', location: 'Berlin', country: 'Deutschland', remoteType: 'remote', salaryMin: 75000, salaryMax: 95000, oteMin: 85000, oteMax: 110000, description: 'Aufbau und Optimierung unserer Revenue Operations. CRM, Reporting, Forecasting und Prozessoptimierung.', requirements: '3+ Jahre RevOps oder Sales Ops Erfahrung. Salesforce/HubSpot Expertise. Analytisches Denken.', isFeatured: false, isAgencyManaged: false, sourceType: 'direct_company_posting', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 2, title: 'Head of Sales DACH', slug: 'head-of-sales-dach-dataflow', roleCategory: 'Head of Sales', seniority: 'head', location: 'Zürich', country: 'Schweiz', remoteType: 'hybrid', salaryMin: 130000, salaryMax: 160000, oteMin: 220000, oteMax: 300000, description: 'Aufbau und Führung des gesamten DACH Sales Teams. Reporting an den VP Sales. Strategische Marktentwicklung.', requirements: '8+ Jahre Sales Erfahrung. Nachweisbare Führungserfahrung. Enterprise SaaS. Fließend DE/EN.', isFeatured: true, isAgencyManaged: true, sourceType: 'agency_managed_job', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 2, title: 'Strategic Account Executive', slug: 'strategic-ae-dataflow', roleCategory: 'Strategic AE', seniority: 'senior', location: 'Zürich', country: 'Schweiz', remoteType: 'hybrid', salaryMin: 100000, salaryMax: 140000, oteMin: 180000, oteMax: 260000, description: 'Betreuung unserer Top-Accounts im DACH-Raum. Strategische Partnerschaften und komplexe Deals.', requirements: '5+ Jahre Enterprise Sales. Track Record mit Deals >500k ARR. C-Level Selling.', isFeatured: true, isAgencyManaged: false, sourceType: 'direct_company_posting', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 2, title: 'Sales Engineer – Pre-Sales', slug: 'sales-engineer-dataflow', roleCategory: 'Sales Engineer', seniority: 'mid', location: 'Zürich', country: 'Schweiz', remoteType: 'hybrid', salaryMin: 90000, salaryMax: 120000, oteMin: 100000, oteMax: 140000, description: 'Technische Unterstützung des Sales Teams. Product Demos, POCs und technische Due Diligence.', requirements: 'Technischer Background plus Sales-Affinität. Erfahrung mit Data/Analytics Produkten. DE/EN.', isFeatured: false, isAgencyManaged: false, sourceType: 'direct_company_posting', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 0, title: 'VP Sales – DACH & Nordics', slug: 'vp-sales-techcorp', roleCategory: 'VP Sales', seniority: 'vp', location: 'München', country: 'Deutschland', remoteType: 'hybrid', salaryMin: 150000, salaryMax: 200000, oteMin: 280000, oteMax: 400000, description: 'Gesamtverantwortung für Revenue in DACH und Nordics. Board-Level Reporting. Teamaufbau von 20 auf 50 Personen.', requirements: '10+ Jahre Sales Leadership. SaaS/Enterprise. Skalierungserfahrung. C-Level Netzwerk.', isFeatured: true, isAgencyManaged: true, sourceType: 'agency_managed_job', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 1, title: 'Account Executive – Enterprise', slug: 'ae-enterprise-cloudscale', roleCategory: 'Enterprise AE', seniority: 'senior', location: 'Frankfurt', country: 'Deutschland', remoteType: 'hybrid', salaryMin: 75000, salaryMax: 100000, oteMin: 130000, oteMax: 180000, description: 'Aufbau unseres Enterprise-Segments. Du bist einer der ersten Enterprise AEs und gestaltest den Segment-Aufbau mit.', requirements: '4+ Jahre B2B SaaS Sales. Cloud/Infrastructure Erfahrung. Hunter-Mentalität.', isFeatured: false, isAgencyManaged: false, sourceType: 'direct_company_posting', status: 'live', approvalStatus: 'approved' },
    { companyIdx: 2, title: 'Mid-Market AE – Österreich', slug: 'midmarket-ae-austria-dataflow', roleCategory: 'Mid-Market AE', seniority: 'mid', location: 'Wien', country: 'Österreich', remoteType: 'hybrid', salaryMin: 65000, salaryMax: 85000, oteMin: 110000, oteMax: 150000, description: 'Marktaufbau in Österreich. Full-Cycle Sales für unsere Data Analytics Plattform im Mid-Market Segment.', requirements: '2-4 Jahre B2B Sales. Lokales Netzwerk in Österreich von Vorteil. Reisebereitschaft.', isFeatured: false, isAgencyManaged: false, sourceType: 'direct_company_posting', status: 'live', approvalStatus: 'approved' },
  ];

  for (const jd of jobsData) {
    const { companyIdx, ...jobFields } = jd;
    await prisma.job.upsert({
      where: { slug: jobFields.slug },
      update: {},
      create: {
        ...jobFields,
        companyId: companies[companyIdx].id,
        employmentType: 'fulltime',
        currency: 'EUR',
        applyViaPlattform: true,
        tags: [jobFields.roleCategory],
        publishedAt: new Date(),
      },
    });
  }
  console.log('✅ 12 Jobs created');

  // ─── Salary Insights ──────────────────────────────────────
  const salaryData = [
    { role: 'SDR', country: 'Deutschland', seniority: 'junior', baseSalaryMin: 38000, baseSalaryMedian: 45000, baseSalaryMax: 55000, oteMin: 55000, oteMedian: 65000, oteMax: 80000, year: 2024, confidenceScore: 0.8, source: 'Marktdaten 2024' },
    { role: 'BDR', country: 'Deutschland', seniority: 'junior', baseSalaryMin: 38000, baseSalaryMedian: 44000, baseSalaryMax: 52000, oteMin: 54000, oteMedian: 63000, oteMax: 75000, year: 2024, confidenceScore: 0.75, source: 'Marktdaten 2024' },
    { role: 'Account Executive', country: 'Deutschland', seniority: 'mid', baseSalaryMin: 55000, baseSalaryMedian: 72000, baseSalaryMax: 90000, oteMin: 90000, oteMedian: 120000, oteMax: 160000, year: 2024, confidenceScore: 0.85, source: 'Marktdaten 2024' },
    { role: 'Enterprise AE', country: 'Deutschland', seniority: 'senior', baseSalaryMin: 75000, baseSalaryMedian: 100000, baseSalaryMax: 135000, oteMin: 130000, oteMedian: 180000, oteMax: 250000, year: 2024, confidenceScore: 0.8, source: 'Marktdaten 2024' },
    { role: 'Sales Manager', country: 'Deutschland', seniority: 'lead', baseSalaryMin: 85000, baseSalaryMedian: 105000, baseSalaryMax: 130000, oteMin: 140000, oteMedian: 180000, oteMax: 230000, year: 2024, confidenceScore: 0.7, source: 'Marktdaten 2024' },
    { role: 'Head of Sales', country: 'Deutschland', seniority: 'head', baseSalaryMin: 100000, baseSalaryMedian: 130000, baseSalaryMax: 170000, oteMin: 170000, oteMedian: 230000, oteMax: 320000, year: 2024, confidenceScore: 0.65, source: 'Marktdaten 2024' },
    { role: 'Enterprise AE', country: 'Schweiz', seniority: 'senior', baseSalaryMin: 100000, baseSalaryMedian: 130000, baseSalaryMax: 170000, oteMin: 180000, oteMedian: 240000, oteMax: 320000, year: 2024, confidenceScore: 0.7, source: 'Marktdaten 2024' },
    { role: 'Account Executive', country: 'Österreich', seniority: 'mid', baseSalaryMin: 50000, baseSalaryMedian: 65000, baseSalaryMax: 82000, oteMin: 80000, oteMedian: 110000, oteMax: 145000, year: 2024, confidenceScore: 0.6, source: 'Marktdaten 2024' },
  ];

  for (const sd of salaryData) {
    await prisma.salaryInsight.create({ data: { ...sd, currency: 'EUR' } });
  }
  console.log('✅ 8 Salary insights created');

  // ─── Company Reviews ──────────────────────────────────────
  const reviewsData = [
    { companyId: companies[0].id, userId: candidateUsers[0].id, compensation: 4.5, quotaRealism: 4.0, leadQuality: 3.5, careerOpportunities: 4.5, productMarketFit: 4.0, management: 4.0, culture: 4.5, workLifeBalance: 3.5, overallRating: 4.1, reviewText: 'Starkes Produkt und gutes Team. Quota ist herausfordernd aber machbar.', pros: 'Gutes Produkt, starkes Team, faire Vergütung', cons: 'Hohe Erwartungen, schnelles Wachstum kann stressig sein', roleAtCompany: 'Account Executive', status: 'approved' },
    { companyId: companies[0].id, userId: candidateUsers[1].id, compensation: 4.0, quotaRealism: 3.5, leadQuality: 4.0, careerOpportunities: 5.0, productMarketFit: 4.5, management: 4.0, culture: 4.5, workLifeBalance: 4.0, overallRating: 4.2, reviewText: 'Beste SDR-Ausbildung die ich hatte. Klarer Karrierepfad zum AE.', pros: 'Ausbildung, Karrierepfad, Team', cons: 'Intensive Ramp-up Phase', roleAtCompany: 'SDR', status: 'approved' },
    { companyId: companies[1].id, userId: candidateUsers[0].id, compensation: 3.5, quotaRealism: 4.5, leadQuality: 3.0, careerOpportunities: 4.0, productMarketFit: 3.5, management: 4.5, culture: 5.0, workLifeBalance: 5.0, overallRating: 4.1, reviewText: 'Tolle Remote-Kultur und sehr faire Work-Life-Balance. Produkt hat noch Potenzial.', pros: 'Remote-First, flexible Zeiten, tolles Management', cons: 'Produkt noch früh, wenige Inbound-Leads', roleAtCompany: 'Account Executive', status: 'approved' },
    { companyId: companies[1].id, userId: candidateUsers[2].id, compensation: 3.5, quotaRealism: 4.0, leadQuality: 3.5, careerOpportunities: 4.5, productMarketFit: 4.0, management: 4.0, culture: 4.5, workLifeBalance: 4.5, overallRating: 4.1, reviewText: 'Spannendes Startup mit viel Gestaltungsfreiraum.', pros: 'Gestaltungsfreiraum, Innovation', cons: 'Prozesse noch im Aufbau', roleAtCompany: 'Sales Manager', status: 'approved' },
    { companyId: companies[2].id, userId: candidateUsers[0].id, compensation: 5.0, quotaRealism: 3.5, leadQuality: 4.0, careerOpportunities: 4.0, productMarketFit: 4.5, management: 3.5, culture: 3.5, workLifeBalance: 3.0, overallRating: 3.9, reviewText: 'Top-Vergütung, aber hoher Druck. Produkt ist stark am Markt positioniert.', pros: 'Gehalt, Produkt, internationale Ausrichtung', cons: 'Work-Life-Balance, Corporate-Strukturen', roleAtCompany: 'Enterprise AE', status: 'approved' },
    { companyId: companies[2].id, userId: candidateUsers[1].id, compensation: 4.5, quotaRealism: 3.0, leadQuality: 4.5, careerOpportunities: 3.5, productMarketFit: 5.0, management: 3.5, culture: 3.0, workLifeBalance: 3.0, overallRating: 3.8, reviewText: 'Produkt verkauft sich gut, aber Erwartungen sind sehr hoch.', pros: 'Starkes Produkt, gute Leads', cons: 'Ambitionierte Quotas, wenig Flexibilität', roleAtCompany: 'SDR', status: 'pending' },
  ];

  for (const rd of reviewsData) {
    await prisma.companyReview.create({ data: rd });
  }
  console.log('✅ 6 Company reviews created');

  // ─── Ranking Snapshots ────────────────────────────────────
  const rankingsData = [
    { companyId: companies[0].id, overallScore: 85, avgRating: 4.15, reviewCount: 2, isVerified: true, hiringActivity: 4, rank: 1, country: 'Deutschland', period: '2024-Q4' },
    { companyId: companies[1].id, overallScore: 82, avgRating: 4.1, reviewCount: 2, isVerified: true, hiringActivity: 3, rank: 2, country: 'Deutschland', period: '2024-Q4' },
    { companyId: companies[2].id, overallScore: 78, avgRating: 3.85, reviewCount: 2, isVerified: true, hiringActivity: 5, rank: 1, country: 'Schweiz', period: '2024-Q4' },
  ];

  for (const rd of rankingsData) {
    await prisma.rankingSnapshot.create({ data: rd });
  }
  console.log('✅ 3 Rankings created');

  // ─── Content Posts ────────────────────────────────────────
  const contentData = [
    {
      title: 'Gehaltsverhandlung im Software Sales – Der komplette Guide',
      slug: 'gehaltsverhandlung-software-sales-guide',
      contentType: 'guide',
      excerpt: 'So verhandelst du dein OTE optimal – von der Vorbereitung bis zum Abschluss.',
      body: '# Gehaltsverhandlung im Software Sales\n\nDie Gehaltsverhandlung ist einer der wichtigsten Momente in deiner Sales-Karriere. In diesem Guide zeigen wir dir, wie du dein OTE optimal verhandelst.\n\n## 1. Vorbereitung\n\nKenne deinen Marktwert. Nutze unsere Gehaltsübersicht, um die aktuellen Benchmarks für deine Rolle zu verstehen.\n\n## 2. Timing\n\nDer beste Zeitpunkt für eine Gehaltsverhandlung ist nach dem ersten Angebot, nicht davor.\n\n## 3. Base vs. OTE\n\nVerstehe den Split zwischen Base Salary und variabler Vergütung. Ein höheres Base gibt dir mehr Sicherheit.\n\n## 4. Verhandlungstaktiken\n\n- Nenne nie als Erster eine Zahl\n- Argumentiere mit Leistung, nicht mit Bedarf\n- Verhandle das Gesamtpaket, nicht nur das Gehalt\n\n## Fazit\n\nEine gute Vorbereitung ist der Schlüssel. Nutze Daten und kenne deinen Wert.',
      isPublished: true,
      publishedAt: new Date('2024-11-01'),
      tags: ['Gehalt', 'Verhandlung', 'Karriere'],
      authorName: 'SalesCareerHub Team',
    },
    {
      title: 'Vom SDR zum Enterprise AE – Dein Karrierepfad',
      slug: 'sdr-zum-enterprise-ae-karrierepfad',
      contentType: 'guide',
      excerpt: 'Der typische Karrierepfad im Software Sales und wie du ihn beschleunigst.',
      body: '# Vom SDR zum Enterprise AE\n\nDer klassische Karrierepfad im Software Sales führt vom SDR über den AE zum Enterprise AE und darüber hinaus.\n\n## SDR (0-2 Jahre)\n\nDein Einstieg in den Software Sales. Hier lernst du die Grundlagen: Prospecting, Cold Calling, Qualification.\n\n## AE – Mid-Market (2-4 Jahre)\n\nDein erster Full-Cycle Sales Job. Du lernst den gesamten Verkaufsprozess von der Demo bis zum Abschluss.\n\n## Enterprise AE (4-7 Jahre)\n\nKomplexe, strategische Deals mit langen Sales Cycles. Hier zählen Beziehungen und strategisches Denken.\n\n## Tipps für den schnellen Aufstieg\n\n1. Übertreffe deine Quote konsistent\n2. Baue Expertise in einer Branche auf\n3. Entwickle Mentoring-Beziehungen\n4. Investiere in deine Weiterbildung',
      isPublished: true,
      publishedAt: new Date('2024-10-15'),
      tags: ['Karriere', 'SDR', 'AE', 'Entwicklung'],
      authorName: 'SalesCareerHub Team',
    },
    {
      title: 'DACH Software Sales Markt 2024 – Trends und Outlook',
      slug: 'dach-sales-markt-2024',
      contentType: 'market_report',
      excerpt: 'Aktuelle Trends, Gehaltsentwicklungen und die gefragtesten Sales-Rollen im DACH-Raum.',
      body: '# DACH Software Sales Markt 2024\n\n## Überblick\n\nDer DACH Software Sales Markt zeigt sich 2024 resilient. Trotz wirtschaftlicher Unsicherheit werden qualifizierte Sales-Professionals stark nachgefragt.\n\n## Gehaltstrends\n\n- Base Salaries sind um 5-8% gestiegen\n- OTE-Strukturen werden aggressiver\n- Remote-Zuschläge werden Standard\n\n## Gefragte Rollen\n\n1. Enterprise AEs mit SaaS-Erfahrung\n2. Revenue Operations Manager\n3. Sales Engineers\n\n## Marktausblick\n\nWir erwarten eine Konsolidierung im Mid-Market Segment und weiteres Wachstum im Enterprise-Bereich.',
      isPublished: true,
      publishedAt: new Date('2024-12-01'),
      tags: ['Markt', 'DACH', 'Trends', '2024'],
      authorName: 'SalesCareerHub Team',
    },
  ];

  for (const cd of contentData) {
    await prisma.contentPost.upsert({
      where: { slug: cd.slug },
      update: {},
      create: cd,
    });
  }
  console.log('✅ 3 Content posts created');

  // ─── Leads ────────────────────────────────────────────────
  await prisma.lead.createMany({
    data: [
      { type: 'company_listing', name: 'Sabine Fischer', email: 'sabine@newstartup.de', company: 'NewStartup GmbH', message: 'Wir möchten 2 Sales-Positionen listen.', status: 'new' },
      { type: 'talent_network', name: 'Tobias Braun', email: 'tobias@email.de', message: 'Suche neue Herausforderung als Enterprise AE.', status: 'new' },
      { type: 'contact', name: 'Petra König', email: 'petra@bigcorp.de', company: 'BigCorp AG', message: 'Interesse an Recruiting-Partnerschaft.', status: 'new' },
    ],
  });
  console.log('✅ 3 Leads created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Admin:     admin@salescareerhub.de');
  console.log('  Company 1: company1@demo.de (TechCorp GmbH)');
  console.log('  Company 2: company2@demo.de (CloudScale AG)');
  console.log('  Company 3: company3@demo.de (DataFlow Solutions)');
  console.log('  Kandidat 1: kandidat1@demo.de (Max Mustermann)');
  console.log('  Kandidat 2: kandidat2@demo.de (Anna Schmidt)');
  console.log('  Kandidat 3: kandidat3@demo.de (Lukas Weber)');
  console.log('\n⚠️  WICHTIG: Die Firebase UIDs in der DB sind Platzhalter.');
  console.log('  Du musst die Benutzer in Firebase erstellen und die UIDs');
  console.log('  in der DB aktualisieren, oder neue Accounts registrieren.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
