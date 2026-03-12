import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const countryLocations: Record<string, string[]> = {
  Deutschland: ['Berlin', 'München', 'Hamburg', 'Frankfurt', 'Köln'],
  Österreich: ['Wien', 'Linz', 'Graz', 'Salzburg'],
  Schweiz: ['Zürich', 'Zug', 'Basel', 'Lausanne'],
};

const variantTemplates = [
  { country: 'Deutschland', remoteType: 'remote', companyStage: 'series-a', companyIdx: 1, sourceType: 'direct_company_posting', featured: false, agencyManaged: false },
  { country: 'Deutschland', remoteType: 'hybrid', companyStage: 'series-b', companyIdx: 0, sourceType: 'agency_managed_job', featured: true, agencyManaged: true },
  { country: 'Österreich', remoteType: 'hybrid', companyStage: 'series-b', companyIdx: 2, sourceType: 'direct_company_posting', featured: false, agencyManaged: false },
  { country: 'Schweiz', remoteType: 'onsite', companyStage: 'series-c', companyIdx: 2, sourceType: 'agency_managed_job', featured: true, agencyManaged: true },
] as const;

const roleDefinitions = [
  {
    roleCategory: 'SDR',
    titleBase: 'Sales Development Representative',
    seniorities: ['junior', 'junior', 'mid', 'mid'],
    baseMins: [42000, 44000, 47000, 52000],
    baseMaxs: [52000, 56000, 62000, 68000],
    oteMins: [62000, 68000, 76000, 84000],
    oteMaxs: [76000, 84000, 92000, 98000],
    industries: ['SaaS', 'AI / Automation', 'MarTech', 'Cyber Security'],
    salesMotions: ['SMB', 'PLG', 'Mid-Market', 'Enterprise'],
    averageDealSizes: [12000, 15000, 22000, 28000],
    salesCycles: [21, 28, 35, 45],
    quotas: ['20 qualifizierte Meetings pro Monat', '18 SQLs pro Monat', '22 Discovery-Slots pro Monat', '15 Enterprise-Pipelines pro Quartal'],
    tags: ['Outbound', 'Prospecting', 'Cold Calling'],
  },
  {
    roleCategory: 'BDR',
    titleBase: 'Business Development Representative',
    seniorities: ['junior', 'mid', 'mid', 'senior'],
    baseMins: [43000, 47000, 50000, 56000],
    baseMaxs: [54000, 60000, 66000, 74000],
    oteMins: [65000, 78000, 84000, 92000],
    oteMaxs: [82000, 92000, 98000, 110000],
    industries: ['Cloud Infrastructure', 'FinTech', 'HR Tech', 'SaaS'],
    salesMotions: ['SMB', 'Mid-Market', 'Channel', 'Enterprise'],
    averageDealSizes: [15000, 25000, 35000, 45000],
    salesCycles: [25, 35, 45, 60],
    quotas: ['Pipeline von 300k pro Quartal', '15 Opportunities pro Monat', 'Partner-Pipeline von 250k', 'Named-Account Coverage für 80 Zielkunden'],
    tags: ['Pipeline Building', 'Outbound', 'Account Research'],
  },
  {
    roleCategory: 'Account Executive',
    titleBase: 'Account Executive',
    seniorities: ['mid', 'mid', 'senior', 'senior'],
    baseMins: [60000, 68000, 76000, 90000],
    baseMaxs: [82000, 90000, 102000, 118000],
    oteMins: [100000, 115000, 135000, 160000],
    oteMaxs: [140000, 155000, 180000, 210000],
    industries: ['SaaS', 'MarTech', 'FinTech', 'HealthTech'],
    salesMotions: ['Full-Cycle', 'Mid-Market', 'Enterprise', 'Named Accounts'],
    averageDealSizes: [30000, 45000, 70000, 90000],
    salesCycles: [40, 55, 75, 90],
    quotas: ['800k New ARR', '1 Mio. ARR', '1.2 Mio. ARR', '1.5 Mio. ARR'],
    tags: ['Full-Cycle', 'Closing', 'Negotiation'],
  },
  {
    roleCategory: 'Mid-Market AE',
    titleBase: 'Mid-Market Account Executive',
    seniorities: ['mid', 'mid', 'senior', 'senior'],
    baseMins: [65000, 70000, 78000, 88000],
    baseMaxs: [85000, 92000, 108000, 122000],
    oteMins: [110000, 120000, 145000, 165000],
    oteMaxs: [150000, 165000, 190000, 220000],
    industries: ['SaaS', 'DevTools', 'AI / Automation', 'Cloud Infrastructure'],
    salesMotions: ['Mid-Market', 'Full-Cycle', 'PLG', 'Enterprise'],
    averageDealSizes: [45000, 60000, 85000, 110000],
    salesCycles: [50, 60, 75, 90],
    quotas: ['900k New ARR', '1 Mio. ARR', '1.3 Mio. ARR', '1.5 Mio. ARR'],
    tags: ['Mid-Market', 'MEDDIC', 'Demo Calls'],
  },
  {
    roleCategory: 'Enterprise AE',
    titleBase: 'Enterprise Account Executive',
    seniorities: ['senior', 'senior', 'lead', 'lead'],
    baseMins: [85000, 95000, 110000, 125000],
    baseMaxs: [115000, 128000, 145000, 160000],
    oteMins: [150000, 170000, 210000, 240000],
    oteMaxs: [210000, 230000, 290000, 330000],
    industries: ['Data & Analytics', 'Cyber Security', 'Cloud Infrastructure', 'SaaS'],
    salesMotions: ['Enterprise', 'Named Accounts', 'Channel', 'Global'],
    averageDealSizes: [90000, 140000, 220000, 300000],
    salesCycles: [90, 110, 140, 170],
    quotas: ['1.5 Mio. ARR', '1.8 Mio. ARR', '2.2 Mio. ARR', '2.5 Mio. ARR'],
    tags: ['Enterprise Sales', 'C-Level', 'Forecasting'],
  },
  {
    roleCategory: 'Strategic AE',
    titleBase: 'Strategic Account Executive',
    seniorities: ['senior', 'lead', 'head', 'head'],
    baseMins: [95000, 110000, 125000, 140000],
    baseMaxs: [125000, 140000, 155000, 175000],
    oteMins: [170000, 210000, 250000, 300000],
    oteMaxs: [240000, 290000, 340000, 420000],
    industries: ['Data & Analytics', 'FinTech', 'Cyber Security', 'SaaS'],
    salesMotions: ['Enterprise', 'Global', 'Named Accounts', 'Channel'],
    averageDealSizes: [180000, 250000, 350000, 500000],
    salesCycles: [120, 150, 180, 210],
    quotas: ['2 Mio. ARR', '2.5 Mio. ARR', '3 Mio. ARR', '4 Mio. ARR'],
    tags: ['Strategic Deals', 'Executive Presence', 'Complex Sales'],
  },
  {
    roleCategory: 'Sales Manager',
    titleBase: 'Sales Manager',
    seniorities: ['lead', 'lead', 'head', 'director'],
    baseMins: [90000, 98000, 115000, 130000],
    baseMaxs: [118000, 128000, 145000, 160000],
    oteMins: [150000, 165000, 200000, 230000],
    oteMaxs: [210000, 225000, 270000, 310000],
    industries: ['SaaS', 'Cloud Infrastructure', 'HR Tech', 'Data & Analytics'],
    salesMotions: ['Mid-Market', 'Enterprise', 'Channel', 'Global'],
    averageDealSizes: [70000, 95000, 140000, 180000],
    salesCycles: [70, 90, 120, 135],
    quotas: ['Teamziel 4 Mio. ARR', 'Teamziel 5 Mio. ARR', 'Forecast Accuracy >90%', 'Ramp-Plan für 6 neue Hires'],
    tags: ['Leadership', 'Pipeline Management', 'Coaching'],
  },
  {
    roleCategory: 'Head of Sales',
    titleBase: 'Head of Sales',
    seniorities: ['head', 'head', 'director', 'vp'],
    baseMins: [115000, 125000, 145000, 165000],
    baseMaxs: [145000, 155000, 175000, 200000],
    oteMins: [190000, 220000, 260000, 320000],
    oteMaxs: [270000, 300000, 360000, 450000],
    industries: ['SaaS', 'Cyber Security', 'Cloud Infrastructure', 'FinTech'],
    salesMotions: ['Enterprise', 'Global', 'Channel', 'Named Accounts'],
    averageDealSizes: [120000, 180000, 240000, 320000],
    salesCycles: [100, 130, 150, 180],
    quotas: ['Regionale Umsatzverantwortung 8 Mio. ARR', 'Pipeline Coverage 4x', 'Internationalisierung DACH', 'Go-to-Market Skalierung'],
    tags: ['Sales Leadership', 'Hiring', 'Forecasting'],
  },
  {
    roleCategory: 'VP Sales',
    titleBase: 'VP Sales',
    seniorities: ['director', 'vp', 'vp', 'c-level'],
    baseMins: [150000, 170000, 185000, 220000],
    baseMaxs: [190000, 210000, 240000, 280000],
    oteMins: [260000, 300000, 360000, 420000],
    oteMaxs: [380000, 430000, 520000, 650000],
    industries: ['SaaS', 'AI / Automation', 'Data & Analytics', 'Cloud Infrastructure'],
    salesMotions: ['Global', 'Enterprise', 'Channel', 'Named Accounts'],
    averageDealSizes: [180000, 260000, 360000, 500000],
    salesCycles: [120, 150, 180, 210],
    quotas: ['Gesamtumsatz 15 Mio. ARR', 'Regionale Expansion', 'Leadership für 30+ Verkäufer', 'Board Reporting & GTM Steuerung'],
    tags: ['Executive Leadership', 'Revenue Strategy', 'Scale-Up'],
  },
  {
    roleCategory: 'Revenue Operations',
    titleBase: 'Revenue Operations Manager',
    seniorities: ['mid', 'senior', 'lead', 'director'],
    baseMins: [68000, 82000, 98000, 120000],
    baseMaxs: [90000, 108000, 126000, 150000],
    oteMins: [85000, 98000, 120000, 145000],
    oteMaxs: [110000, 125000, 150000, 185000],
    industries: ['SaaS', 'Cloud Infrastructure', 'MarTech', 'Data & Analytics'],
    salesMotions: ['PLG', 'Mid-Market', 'Enterprise', 'Global'],
    averageDealSizes: [25000, 50000, 85000, 120000],
    salesCycles: [35, 50, 70, 90],
    quotas: ['Forecast Accuracy 95%', 'Funnel Conversion +15%', 'CRM Hygiene 98%', 'Planungszyklus für Revenue Teams'],
    tags: ['RevOps', 'Salesforce', 'Forecasting'],
  },
  {
    roleCategory: 'Sales Engineer',
    titleBase: 'Sales Engineer',
    seniorities: ['mid', 'senior', 'senior', 'lead'],
    baseMins: [75000, 90000, 98000, 110000],
    baseMaxs: [98000, 116000, 128000, 145000],
    oteMins: [95000, 120000, 135000, 160000],
    oteMaxs: [125000, 150000, 170000, 205000],
    industries: ['Cyber Security', 'Cloud Infrastructure', 'Data & Analytics', 'DevTools'],
    salesMotions: ['Mid-Market', 'Enterprise', 'Channel', 'Global'],
    averageDealSizes: [45000, 90000, 150000, 220000],
    salesCycles: [50, 75, 95, 120],
    quotas: ['Demo-to-Proposal Conversion 60%', 'POC Success >70%', 'Technische Champion-Building', 'Solution Win Rate verbessern'],
    tags: ['Pre-Sales', 'Technical Discovery', 'Solution Selling'],
  },
  {
    roleCategory: 'Customer Success',
    titleBase: 'Customer Success Manager',
    seniorities: ['mid', 'senior', 'lead', 'head'],
    baseMins: [58000, 70000, 85000, 102000],
    baseMaxs: [76000, 92000, 108000, 130000],
    oteMins: [75000, 92000, 110000, 140000],
    oteMaxs: [98000, 120000, 145000, 185000],
    industries: ['HR Tech', 'SaaS', 'MarTech', 'HealthTech'],
    salesMotions: ['PLG', 'Mid-Market', 'Enterprise', 'Global'],
    averageDealSizes: [20000, 40000, 70000, 110000],
    salesCycles: [30, 45, 60, 75],
    quotas: ['NRR >105%', 'Expansion Pipeline 400k', 'Churn <5%', 'Enterprise Renewal Plan'],
    tags: ['Retention', 'Expansion', 'Stakeholder Management'],
  },
] as const;

function buildJobDescription(titleBase: string, roleCategory: string, country: string, remoteType: string, industry: string, companyStage: string, salesMotion: string, averageDealSize: number, salesCycleLength: number) {
  return [
    `Ein Unternehmen im Bereich ${industry} sucht für ein ${companyStage}-Setup in ${country} eine Person für ${titleBase}.`,
    `Die Rolle bewegt sich im Feld ${roleCategory} und arbeitet in einem ${remoteType === 'remote' ? 'remote-first' : remoteType === 'hybrid' ? 'hybriden' : 'vor-Ort'} Umfeld mit Fokus auf ${salesMotion}.`,
    `Relevant sind strukturierter Pipeline-Aufbau, belastbare Abschlusslogik und Erfahrung mit durchschnittlichen Dealgrößen um ${averageDealSize.toLocaleString('de-DE')} EUR bei Sales Cycles von rund ${salesCycleLength} Tagen.`,
  ].join(' ');
}

function buildRequirements(roleCategory: string, seniority: string, salesMotion: string, country: string) {
  return [
    `Mehrjährige Erfahrung im Bereich ${roleCategory} auf ${seniority}-Niveau oder klar nachweisbare Lernkurve in angrenzenden Rollen.`,
    `Sicherer Umgang mit ${salesMotion} Prozessen, strukturierter Qualification und stakeholderbasiertem Selling.`,
    `Sehr gute Kommunikation auf Deutsch sowie professionelle Zusammenarbeit im Markt ${country}.`,
  ].join(' ');
}

function buildBenefits(remoteType: string, companyStage: string, industry: string) {
  return [
    `${remoteType === 'remote' ? 'Remote-first Zusammenarbeit' : remoteType === 'hybrid' ? 'Hybrid Setup mit flexiblen Präsenztagen' : 'Klare Vor-Ort Zusammenarbeit mit engem Stakeholder-Zugang'}`,
    `Sichtbarer Einfluss in einem ${companyStage}-Umfeld im Feld ${industry}`,
    'Strukturierter Hiring-Prozess mit Briefing, Feedback und transparenter Timeline',
  ].join(' · ');
}

function generateJobsData() {
  return roleDefinitions.flatMap((definition, roleIndex) =>
    variantTemplates.map((template, variantIndex) => {
      const locationOptions = countryLocations[template.country];
      const location = locationOptions[(roleIndex + variantIndex) % locationOptions.length];
      const seniority = definition.seniorities[variantIndex];
      const industry = definition.industries[variantIndex];
      const salesMotion = definition.salesMotions[variantIndex];
      const averageDealSize = definition.averageDealSizes[variantIndex];
      const salesCycleLength = definition.salesCycles[variantIndex];
      const title = `${definition.titleBase} – ${template.country === 'Deutschland' ? 'DACH' : template.country}`;
      const slug = `demo-${definition.roleCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${template.country.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${variantIndex + 1}`;
      const descriptionAnonymized = buildJobDescription(
        definition.titleBase,
        definition.roleCategory,
        template.country,
        template.remoteType,
        industry,
        template.companyStage,
        salesMotion,
        averageDealSize,
        salesCycleLength,
      );

      return {
        companyIdx: template.companyIdx,
        title,
        slug,
        roleCategory: definition.roleCategory,
        seniority,
        location,
        country: template.country,
        remoteType: template.remoteType,
        industry,
        companyStage: template.companyStage,
        salaryMin: definition.baseMins[variantIndex],
        salaryMax: definition.baseMaxs[variantIndex],
        oteMin: definition.oteMins[variantIndex],
        oteMax: definition.oteMaxs[variantIndex],
        description: descriptionAnonymized,
        descriptionOriginal: descriptionAnonymized,
        descriptionAnonymized,
        requirements: buildRequirements(definition.roleCategory, seniority, salesMotion, template.country),
        benefits: buildBenefits(template.remoteType, template.companyStage, industry),
        salesMotion,
        averageDealSize,
        salesCycleLength,
        quota: definition.quotas[variantIndex],
        isFeatured: template.featured,
        isAgencyManaged: template.agencyManaged,
        sourceType: template.sourceType,
        originalCompanyName: null,
        anonymizedCompanyProfile: `Ein ${template.companyStage}-Unternehmen im Bereich ${industry} mit Fokus auf ${salesMotion} im Markt ${template.country}`,
        tags: [...definition.tags, industry, salesMotion],
      };
    }),
  );
}

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

  const candidateProfiles: any[] = [];
  for (const p of profiles) {
    const profile = await prisma.candidateProfile.upsert({
      where: { userId: p.userId },
      update: {},
      create: p,
    });
    candidateProfiles.push(profile);
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
  const jobsData = generateJobsData();
  const seededJobs: any[] = [];
  for (const jd of jobsData) {
    const { companyIdx, ...jobFields } = jd;
    const seededJob = await prisma.job.upsert({
      where: { slug: jobFields.slug },
      update: {
        ...jobFields,
        companyId: companies[companyIdx].id,
        employmentType: 'fulltime',
        currency: 'EUR',
        applyViaPlattform: true,
        tags: jobFields.tags,
        publishedAt: new Date(),
      },
      create: {
        ...jobFields,
        companyId: companies[companyIdx].id,
        employmentType: 'fulltime',
        currency: 'EUR',
        applyViaPlattform: true,
        tags: jobFields.tags,
        status: 'live',
        approvalStatus: 'approved',
        publishedAt: new Date(),
      },
    });
    seededJobs.push(seededJob);
  }
  console.log(`✅ ${jobsData.length} Jobs created`);

  const demoApplications = [
    { jobSlug: jobsData[0].slug, candidateIdx: 0, status: 'interest_expressed', fitScore: 86, daysAgo: 2, candidateMessage: 'Ich passe gut auf die Rolle, weil ich gerade ähnliche KPIs verantworte.' },
    { jobSlug: jobsData[4].slug, candidateIdx: 0, status: 'screening', fitScore: 82, daysAgo: 5, candidateMessage: 'Besonders spannend finde ich das Segment und die DACH-Verantwortung.' },
    { jobSlug: jobsData[8].slug, candidateIdx: 0, status: 'shortlisted', fitScore: 88, daysAgo: 7, candidateMessage: 'Ich suche bewusst einen strukturierten Wechsel in ein stärkeres Mid-Market Umfeld.' },
    { jobSlug: jobsData[12].slug, candidateIdx: 0, status: 'forwarded', fitScore: 91, daysAgo: 10, candidateMessage: 'Mein Track Record bei komplexeren Discovery-Prozessen passt sehr gut auf das Profil.' },
    { jobSlug: jobsData[16].slug, candidateIdx: 0, status: 'interview_1', fitScore: 93, daysAgo: 14, candidateMessage: 'Enterprise Buying Committees und Value Selling sind mein Alltag.' },
    { jobSlug: jobsData[20].slug, candidateIdx: 0, status: 'interview_2', fitScore: 95, daysAgo: 18, candidateMessage: 'Ich kann konkrete Beispiele zu Forecasting und Multi-Threading im Interview teilen.' },
    { jobSlug: jobsData[24].slug, candidateIdx: 0, status: 'offer', fitScore: 90, daysAgo: 22, candidateMessage: 'Für mich sind Scope, OTE und Teamqualität die zentralen Punkte im finalen Schritt.' },
    { jobSlug: jobsData[28].slug, candidateIdx: 0, status: 'hired', fitScore: 89, daysAgo: 30, candidateMessage: 'Der Prozess lief sehr strukturiert und nah an meinem Zielprofil.' },
    { jobSlug: jobsData[32].slug, candidateIdx: 0, status: 'rejected', fitScore: 74, daysAgo: 12, candidateMessage: 'Trotzdem wertvoller Prozess mit gutem Feedback.' },
    { jobSlug: jobsData[36].slug, candidateIdx: 0, status: 'withdrawn', fitScore: 79, daysAgo: 9, candidateMessage: 'Ich habe mich parallel für eine andere Rolle entschieden.' },
    { jobSlug: jobsData[40].slug, candidateIdx: 1, status: 'interview_1', fitScore: 84, daysAgo: 6, candidateMessage: 'Ich möchte den nächsten Karriereschritt aus einer SDR-Rolle heraus machen.' },
    { jobSlug: jobsData[44].slug, candidateIdx: 1, status: 'screening', fitScore: 81, daysAgo: 3, candidateMessage: 'Ich bringe starken Outbound-Fokus und viel Energie für eine AE-Rampe mit.' },
  ];

  const seededJobBySlug = new Map(seededJobs.map((job) => [job.slug, job]));
  await prisma.application.deleteMany({
    where: {
      candidateId: { in: candidateProfiles.map((profile) => profile.id) },
      jobId: { in: seededJobs.map((job) => job.id) },
    },
  });

  for (const demoApplication of demoApplications) {
    const job = seededJobBySlug.get(demoApplication.jobSlug);
    const candidateProfile = candidateProfiles[demoApplication.candidateIdx] as any;
    if (!job || !candidateProfile) continue;

    const createdAt = new Date();
    createdAt.setUTCDate(createdAt.getUTCDate() - demoApplication.daysAgo);

    await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidateProfile.id,
        status: demoApplication.status,
        fitScore: demoApplication.fitScore,
        candidateMessage: demoApplication.candidateMessage,
        forwardedAt: ['forwarded', 'interview_1', 'interview_2', 'offer', 'hired'].includes(demoApplication.status) ? createdAt : null,
        createdAt,
      } as any,
    });
  }

  const prismaAny = prisma as any;

  await prismaAny.recruitingCall.deleteMany({
    where: { candidateId: { in: candidateProfiles.slice(0, 2).map((profile) => profile.id) } },
  });

  await prismaAny.recruitingCall.createMany({
    data: [
      {
        candidateId: candidateProfiles[0].id,
        scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        callType: 'intro_call',
        meetingLink: 'https://calendar.mock/salescareerhub/intro-max',
        notes: 'Briefing-Call mit Fokus auf Hiring-Team Vorbereitung',
      },
      {
        candidateId: candidateProfiles[0].id,
        scheduledTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        callType: 'hiring_interview',
        meetingLink: 'https://calendar.mock/salescareerhub/hiring-max',
        notes: 'Mock-Hiring-Team Termin',
      },
      {
        candidateId: candidateProfiles[1].id,
        scheduledTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        callType: 'intro_call',
        meetingLink: 'https://calendar.mock/salescareerhub/intro-anna',
        notes: 'Erster Recruiter-Call für den AE-Track',
      },
    ],
  });

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
