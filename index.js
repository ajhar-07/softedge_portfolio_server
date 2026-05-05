import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { ObjectId } from 'mongodb'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeMongo, connectMongo, getMongoClient } from './config/mongodb.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = Number(process.env.PORT) || 5000
const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB_NAME || 'softedge_portfolio'
const ADMIN_EMAILS = ['ajharfahim1@gmail.com']

const uploadDir = path.join(__dirname, 'uploads')
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^\w.-]/g, '_')}`
    cb(null, safe)
  },
})
const upload = multer({ storage })

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(uploadDir))

function getUsersCollection() {
  return getMongoClient().db(DB_NAME).collection('users')
}

function getServicesCollection() {
  return getMongoClient().db(DB_NAME).collection('services')
}

function getPageContentCollection() {
  return getMongoClient().db(DB_NAME).collection('page_content')
}

function getBlogCommentsCollection() {
  return getMongoClient().db(DB_NAME).collection('blog_comments')
}

function toUserResponse(user) {
  if (!user) return null

  return {
    ...user,
    _id: user._id?.toString(),
  }
}

function normalizeEmail(email = '') {
  return email.trim().toLowerCase()
}

function resolveUserRole(email, fallbackRole = 'user') {
  return ADMIN_EMAILS.includes(normalizeEmail(email)) ? 'admin' : fallbackRole
}

function normalizeDocument(document) {
  if (!document) return null

  return {
    ...document,
    _id: document._id?.toString(),
  }
}

function validateServicePayload(payload = {}, { partial = false } = {}) {
  const errors = []
  const title = typeof payload.title === 'string' ? payload.title.trim() : ''
  const description = typeof payload.description === 'string' ? payload.description.trim() : ''
  const icon = typeof payload.icon === 'string' ? payload.icon.trim() : ''

  if (!partial || 'title' in payload) {
    if (!title) errors.push('title is required')
  }

  if (!partial || 'description' in payload) {
    if (!description) errors.push('description is required')
  }

  if (!partial || 'icon' in payload) {
    if (!icon) errors.push('icon is required')
  }

  return {
    errors,
    value: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(icon ? { icon } : {}),
    },
  }
}

const informationSecuritySections = {
  serviceLinks: 'serviceLinks',
  faqs: 'faqs',
  highlights: 'highlights',
  socials: 'socials',
}

function getDefaultInformationSecurityPage() {
  return {
    key: 'information-security-page',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    mainImage:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1400&q=80',
    heroTitle: 'Information Security',
    sectionTitle: 'Information Security',
    sectionDescription:
      'Information security is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more or-less normal distribution of letters, as opposed to using content here.',
    bottomDescription:
      'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which do not look even slightly believable.',
    brochuresTitle: 'Brochures',
    brochuresDescription: 'Cras enim urna, interdum nec porttitor vitae, sollicitudin eu eros.',
    brochuresPrimaryButton: 'Download',
    brochuresSecondaryButton: 'Discover',
    followUsTitle: 'Follow Us',
    serviceLinks: [
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Mobile Platforms', to: '/mobile-platform' },
      { _id: new ObjectId().toString(), label: 'Data Synchronization', to: '/data-synchronization' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
      { _id: new ObjectId().toString(), label: 'Event Processing', to: '/event-processing' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
    ],
    highlights: [
      {
        _id: new ObjectId().toString(),
        title: 'Strategy',
        description: 'We focus on the best practices for IT solutions and services with secure planning.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Restructuring',
        description: 'We focus on the best practices for IT solutions and services through modern frameworks.',
      },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        question: 'Why we are best company?',
        answer:
          'We are committed to providing our customers with exceptional service while offering our employees the best training. Our process is structured, measurable, and security-first.',
        open: true,
      },
      {
        _id: new ObjectId().toString(),
        question: 'How the template process works?',
        answer:
          'We start with discovery, continue with architecture and implementation, and then monitor outcomes with regular optimization cycles.',
        open: false,
      },
      {
        _id: new ObjectId().toString(),
        question: 'What should be listed on a business card?',
        answer:
          'Business name, your role, primary contact details, website, and a clear value proposition line are the essentials.',
        open: false,
      },
    ],
    socials: [
      { _id: new ObjectId().toString(), label: 'f' },
      { _id: new ObjectId().toString(), label: 't' },
      { _id: new ObjectId().toString(), label: 'i' },
      { _id: new ObjectId().toString(), label: 'in' },
    ],
  }
}

function validateInformationSecurityArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === informationSecuritySections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === informationSecuritySections.faqs) {
    const question = typeof payload.question === 'string' ? payload.question.trim() : ''
    const answer = typeof payload.answer === 'string' ? payload.answer.trim() : ''
    if (!partial || 'question' in payload) {
      if (!question) errors.push('question is required')
      else value.question = question
    }
    if (!partial || 'answer' in payload) {
      if (!answer) errors.push('answer is required')
      else value.answer = answer
    }
    if ('open' in payload || !partial) {
      value.open = Boolean(payload.open)
    }
  }

  if (section === informationSecuritySections.highlights) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const description = typeof payload.description === 'string' ? payload.description.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'description' in payload) {
      if (!description) errors.push('description is required')
      else value.description = description
    }
  }

  if (section === informationSecuritySections.socials) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  return { errors, value }
}

const mobilePlatformSections = {
  serviceLinks: 'serviceLinks',
  socials: 'socials',
  checklist: 'checklist',
  team: 'team',
  skills: 'skills',
}

const dataSynchronizationSections = {
  serviceLinks: 'serviceLinks',
  socials: 'socials',
  featureCards: 'featureCards',
}

const processAutomationSections = {
  serviceLinks: 'serviceLinks',
  socials: 'socials',
  cards: 'cards',
  faqs: 'faqs',
}

const educationalInstituteManagementSections = {
  serviceLinks: 'serviceLinks',
  socials: 'socials',
  cards: 'cards',
  faqs: 'faqs',
  featureBullets: 'featureBullets',
}

const erpSoftwareSections = {
  serviceLinks: 'serviceLinks',
  socials: 'socials',
  cards: 'cards',
  faqs: 'faqs',
  featureBullets: 'featureBullets',
}

const hospitalManagementSoftwareSections = {
  serviceLinks: 'serviceLinks',
  stats: 'stats',
  modules: 'modules',
  timeline: 'timeline',
  spotlight: 'spotlight',
  faqs: 'faqs',
  asideLinks: 'asideLinks',
}

const pharmacyManagementSoftwareSections = {
  serviceLinks: 'serviceLinks',
  highlights: 'highlights',
  capabilities: 'capabilities',
  honeycomb: 'honeycomb',
  faqs: 'faqs',
}

const restaurantManagementSoftwareSections = {
  serviceLinks: 'serviceLinks',
  topPills: 'topPills',
  modules: 'modules',
  spotlight: 'spotlight',
  timeline: 'timeline',
  stats: 'stats',
  faqs: 'faqs',
}

const inventoryManagementSoftwareSections = {
  serviceLinks: 'serviceLinks',
  overviewCards: 'overviewCards',
  operationsFlow: 'operationsFlow',
  integrationGrid: 'integrationGrid',
  outcomes: 'outcomes',
  capabilities: 'capabilities',
  metrics: 'metrics',
  faqs: 'faqs',
}

const municipalityUnionManagementSections = {
  serviceLinks: 'serviceLinks',
  civicModules: 'civicModules',
  processTimeline: 'processTimeline',
  performanceCards: 'performanceCards',
  governanceFeatures: 'governanceFeatures',
  faq: 'faq',
}

const paymentGatewaysSections = {
  heroStats: 'heroStats',
  serviceLinks: 'serviceLinks',
  rails: 'rails',
  partnerChannels: 'partnerChannels',
  flowSteps: 'flowSteps',
  riskLayers: 'riskLayers',
  walletCapabilities: 'walletCapabilities',
  metrics: 'metrics',
  businessUseCases: 'businessUseCases',
  faqs: 'faqs',
}

const websiteDevelopmentSections = {
  introPoints: 'introPoints',
  quickLinks: 'quickLinks',
  designPillars: 'designPillars',
  deliveryTracks: 'deliveryTracks',
  packageGrid: 'packageGrid',
  serviceDetails: 'serviceDetails',
  projectShowcase: 'projectShowcase',
  stack: 'stack',
  stats: 'stats',
  faqs: 'faqs',
}

const landingPageDesignSections = {
  quickActions: 'quickActions',
  campaignTypes: 'campaignTypes',
  sectionBlocks: 'sectionBlocks',
  processFlow: 'processFlow',
  conversionStats: 'conversionStats',
  pricingCards: 'pricingCards',
  faqs: 'faqs',
}

const ecommerceNewsPortalSections = {
  quickLinks: 'quickLinks',
  commerceModules: 'commerceModules',
  newsroomFlow: 'newsroomFlow',
  monetizationCards: 'monetizationCards',
  architectureHighlights: 'architectureHighlights',
  audienceSolutions: 'audienceSolutions',
  integrationSuite: 'integrationSuite',
  packageGrid: 'packageGrid',
  faqs: 'faqs',
}

const domainHostingServerSections = {
  quickLinks: 'quickLinks',
  domainServices: 'domainServices',
  hostingStacks: 'hostingStacks',
  serverOpsFlow: 'serverOpsFlow',
  supportPackages: 'supportPackages',
  securityCoverage: 'securityCoverage',
  migrationChecklist: 'migrationChecklist',
  platformCoverage: 'platformCoverage',
  reliabilityMetrics: 'reliabilityMetrics',
  faqs: 'faqs',
}

const eventProcessingSections = {
  serviceLinks: 'serviceLinks',
  socials: 'socials',
  checklist: 'checklist',
  benefits: 'benefits',
}

const contentManagementSections = {
  serviceLinks: 'serviceLinks',
  socials: 'socials',
  gallery: 'gallery',
  checklist: 'checklist',
}

function getDefaultMobilePlatformPage() {
  return {
    key: 'mobile-platform-page',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    topImageLeft:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80',
    topImageRight:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1000&q=80',
    heroTitle: 'Mobile Platforms',
    sectionTitle: 'Mobile Platforms',
    sectionDescription:
      'Mobile platform strategy provides strong foundations for secure apps, strong UX, and scalable backend integrations. We build products that stay reliable across device versions and high traffic.',
    bottomDescription:
      'There are many variations of passages available, but the majority have suffered alteration in some form, by injected humour, or randomised words which do not look even slightly believable.',
    mainServicesTitle: 'Main Services',
    brochuresTitle: 'Brochures',
    brochuresDescription:
      'Cras enim urna, interdum nec porttitor vitae, sollicitudin eu eros. Praesent eget mollis nulla.',
    brochuresPrimaryButton: 'Download',
    brochuresSecondaryButton: 'Discover',
    followUsTitle: 'Follow Us',
    teamTitle: 'Our Team',
    serviceLinks: [
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Mobile Platforms', to: '/mobile-platform' },
      { _id: new ObjectId().toString(), label: 'Data Synchronization', to: '/data-synchronization' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
      { _id: new ObjectId().toString(), label: 'Event Processing', to: '/event-processing' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
    ],
    socials: [
      { _id: new ObjectId().toString(), label: 'f' },
      { _id: new ObjectId().toString(), label: 't' },
      { _id: new ObjectId().toString(), label: 'i' },
      { _id: new ObjectId().toString(), label: 'in' },
    ],
    checklist: [
      { _id: new ObjectId().toString(), text: 'Marketing options and rates' },
      { _id: new ObjectId().toString(), text: 'Research beyond the business plan' },
      { _id: new ObjectId().toString(), text: 'The ability to turnaround consulting' },
      { _id: new ObjectId().toString(), text: 'Customer engagement matters' },
    ],
    team: [
      {
        _id: new ObjectId().toString(),
        name: 'Hamish French',
        role: 'Computer Scientist',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Zara Matheson',
        role: 'CEO',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Dylan Bonney',
        role: 'Process Analyst',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
      },
    ],
    skills: [
      { _id: new ObjectId().toString(), label: 'Consulting', value: 65 },
      { _id: new ObjectId().toString(), label: 'Development', value: 80 },
      { _id: new ObjectId().toString(), label: 'Management', value: 55 },
    ],
  }
}

function validateMobilePlatformArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === mobilePlatformSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === mobilePlatformSections.socials) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === mobilePlatformSections.checklist) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === mobilePlatformSections.team) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const role = typeof payload.role === 'string' ? payload.role.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if (!partial || 'role' in payload) {
      if (!role) errors.push('role is required')
      else value.role = role
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
  }

  if (section === mobilePlatformSections.skills) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const hasValueField = 'value' in payload || !partial
    const numericValue = Number(payload.value)
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (hasValueField) {
      if (!Number.isFinite(numericValue)) {
        errors.push('value must be a valid number')
      } else if (numericValue < 0 || numericValue > 100) {
        errors.push('value must be between 0 and 100')
      } else {
        value.value = numericValue
      }
    }
  }

  return { errors, value }
}

function getDefaultDataSynchronizationPage() {
  return {
    key: 'data-synchronization-page',
    heroImage:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80',
    mainImage:
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1400&q=80',
    heroTitle: 'Data Synchronization',
    sectionTitle: 'Data Synchronization',
    sectionDescription:
      'Data synchronization keeps your systems aligned in real time. We focus on reliable pipelines, conflict resolution, and secure transfers so your teams always work from a single source of truth.',
    bottomDescriptionTop:
      'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which do not look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there is not anything embarrassing hidden.',
    bottomDescriptionBottom:
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
    mainServicesTitle: 'Main Services',
    brochuresTitle: 'Brochures',
    brochuresDescription:
      'Cras enim urna, interdum nec porttitor vitae, sollicitudin eu eros. Praesent eget mollis nulla.',
    brochuresPrimaryButton: 'Download',
    brochuresOrLabel: 'OR',
    brochuresSecondaryButton: 'Discover',
    followUsTitle: 'Follow Us',
    quoteText:
      "It's the perfect solution for our business. Thanks guys, keep up the good work! It's really wonderful. It's the perfect solution for our business.",
    quoteAuthor: 'William Blake',
    serviceLinks: [
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Mobile Platforms', to: '/mobile-platform' },
      { _id: new ObjectId().toString(), label: 'Data Synchronization', to: '/data-synchronization' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
      { _id: new ObjectId().toString(), label: 'Event Processing', to: '/event-processing' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
    ],
    socials: [
      { _id: new ObjectId().toString(), label: 'f' },
      { _id: new ObjectId().toString(), label: 't' },
      { _id: new ObjectId().toString(), label: 'i' },
      { _id: new ObjectId().toString(), label: 'in' },
    ],
    featureCards: [
      {
        _id: new ObjectId().toString(),
        title: 'Processes Optimization',
        description: 'Streamline how data moves between apps and databases with monitoring, retries, and clear ownership.',
        icon: 'cube',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Standards Compliance',
        description: 'Align synchronization policies with industry expectations and your internal security requirements.',
        icon: 'sliders',
      },
    ],
  }
}

function validateDataSynchronizationArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === dataSynchronizationSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === dataSynchronizationSections.socials) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === dataSynchronizationSections.featureCards) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const description = typeof payload.description === 'string' ? payload.description.trim() : ''
    const icon = typeof payload.icon === 'string' ? payload.icon.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'description' in payload) {
      if (!description) errors.push('description is required')
      else value.description = description
    }
    if (!partial || 'icon' in payload) {
      if (!icon) errors.push('icon is required')
      else value.icon = icon
    }
  }

  return { errors, value }
}

function getDefaultProcessAutomationPage() {
  return {
    key: 'process-automation-page',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    heroStripImage:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80',
    heroTitle: 'Process Automation',
    sectionTitle: 'Process Automation',
    sectionDescription:
      'Process automation is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using content here.',
    sectionDescriptionBottom:
      'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which do not look even slightly believable.',
    finalDescription:
      'If you are going to use a passage of Lorem Ipsum, you need to be sure there is not anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary.',
    stripLabel: 'Automation',
    mainServicesTitle: 'Main Services',
    brochuresTitle: 'Brochures',
    brochuresDescription:
      'Cras enim urna, interdum nec porttitor vitae, sollicitudin eu eros. Praesent eget mollis nulla.',
    brochuresPrimaryButton: 'Download',
    brochuresOrLabel: 'OR',
    brochuresSecondaryButton: 'Discover',
    followUsTitle: 'Follow Us',
    serviceLinks: [
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Mobile Platforms', to: '/mobile-platform' },
      { _id: new ObjectId().toString(), label: 'Data Synchronization', to: '/data-synchronization' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
      { _id: new ObjectId().toString(), label: 'Event Processing', to: '/event-processing' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
    ],
    socials: [
      { _id: new ObjectId().toString(), label: 'f' },
      { _id: new ObjectId().toString(), label: 't' },
      { _id: new ObjectId().toString(), label: 'i' },
      { _id: new ObjectId().toString(), label: 'in' },
    ],
    cards: [
      {
        _id: new ObjectId().toString(),
        title: 'Web Development',
        description: 'We focus on the best practices for IT solutions and services with reliable delivery.',
        image: 'https://images.unsplash.com/photo-1498050100023-c117bdebc3b4?auto=format&fit=crop&w=900&q=80',
        icon: 'code',
        variant: 'overlay',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Branding Services',
        description: '',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
        icon: 'megaphone',
        variant: 'footer',
      },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        question: '1. Why we are best company?',
        answer:
          'We are committed to providing our customers with exceptional service while offering our employees the best training. Our automation approach is structured, measurable, and scalable.',
        open: true,
      },
      {
        _id: new ObjectId().toString(),
        question: '2. How the template process works?',
        answer:
          'We start with discovery, map workflows, implement integrations, and iterate with monitoring and feedback loops.',
        open: false,
      },
      {
        _id: new ObjectId().toString(),
        question: '3. What should be listed on a business card?',
        answer:
          'Business name, your role, primary contact details, website, and a clear value proposition line are the essentials.',
        open: false,
      },
    ],
  }
}

function validateProcessAutomationArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === processAutomationSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === processAutomationSections.socials) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === processAutomationSections.cards) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const description = typeof payload.description === 'string' ? payload.description.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    const icon = typeof payload.icon === 'string' ? payload.icon.trim() : ''
    const variant = typeof payload.variant === 'string' ? payload.variant.trim() : ''

    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if ('description' in payload || !partial) {
      value.description = description
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
    if (!partial || 'icon' in payload) {
      if (!icon) errors.push('icon is required')
      else value.icon = icon
    }
    if (!partial || 'variant' in payload) {
      if (!variant) errors.push('variant is required')
      else value.variant = variant
    }
  }

  if (section === processAutomationSections.faqs) {
    const question = typeof payload.question === 'string' ? payload.question.trim() : ''
    const answer = typeof payload.answer === 'string' ? payload.answer.trim() : ''
    if (!partial || 'question' in payload) {
      if (!question) errors.push('question is required')
      else value.question = question
    }
    if (!partial || 'answer' in payload) {
      if (!answer) errors.push('answer is required')
      else value.answer = answer
    }
    if ('open' in payload || !partial) {
      value.open = Boolean(payload.open)
    }
  }

  return { errors, value }
}

function getDefaultEducationalInstituteManagementPage() {
  return {
    key: 'educational-institute-management-page',
    heroImage:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=80',
    heroStripImage:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80',
    heroTitle: 'Educational Institute Management Software',
    sectionTitle: 'One platform for your entire campus',
    sectionDescription:
      'SoftEdge Educational Institute Management Software (EIMS) brings admissions, academics, finance, HR, examinations, library, transport, and communication into a single secure system. Reduce paperwork, improve transparency for guardians, and give teachers and administrators accurate data in real time.',
    sectionDescriptionBottom:
      'Whether you run a school, college, coaching centre, or multi-branch group, modules can be phased in to match your budget and maturity—from core student information and fee collection to advanced analytics and mobile apps for parents and staff.',
    finalDescription:
      'We implement role-based access, audit trails, backups, and optional cloud or on-premise deployment. Our team helps you migrate legacy spreadsheets, train users, and integrate payment gateways, SMS, and biometric devices where required.',
    stripLabel: 'EIMS',
    mainServicesTitle: 'Main Services',
    brochuresTitle: 'Brochures',
    brochuresDescription:
      'Download a concise overview of modules, deployment options, and typical rollout timelines for educational institutes.',
    brochuresPrimaryButton: 'Download',
    brochuresOrLabel: 'OR',
    brochuresSecondaryButton: 'Discover',
    followUsTitle: 'Follow Us',
    serviceLinks: [
      {
        _id: new ObjectId().toString(),
        label: 'Educational Institute Management',
        to: '/educational-institute-management',
      },
      { _id: new ObjectId().toString(), label: 'Our Services', to: '/services' },
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Mobile Platform', to: '/mobile-platform' },
      { _id: new ObjectId().toString(), label: 'Data Synchronization', to: '/data-synchronization' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
      { _id: new ObjectId().toString(), label: 'Event Processing', to: '/event-processing' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
    ],
    socials: [
      { _id: new ObjectId().toString(), label: 'f' },
      { _id: new ObjectId().toString(), label: 't' },
      { _id: new ObjectId().toString(), label: 'i' },
      { _id: new ObjectId().toString(), label: 'in' },
    ],
    cards: [
      {
        _id: new ObjectId().toString(),
        title: 'Student lifecycle & academics',
        description:
          'Admissions, class sections, attendance, timetable, homework, grade-books, report cards, and certificates—aligned to your board or curriculum.',
        image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=900&q=80',
        icon: 'book',
        variant: 'overlay',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Finance & operations',
        description: '',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
        icon: 'chart',
        variant: 'footer',
      },
    ],
    featureBullets: [
      {
        _id: new ObjectId().toString(),
        text: 'Guardian portal & SMS/email alerts for fees, attendance, and results',
      },
      {
        _id: new ObjectId().toString(),
        text: 'Online admission forms, merit lists, and seat planning',
      },
      {
        _id: new ObjectId().toString(),
        text: 'Exam seating, invigilation, marks entry, and tabulation with moderation rules',
      },
      {
        _id: new ObjectId().toString(),
        text: 'Library catalog, issue/return, and overdue reminders',
      },
      {
        _id: new ObjectId().toString(),
        text: 'Hostel, transport routes, vehicle and driver roster',
      },
      {
        _id: new ObjectId().toString(),
        text: 'Staff payroll, leave, and substitute teacher scheduling',
      },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        question: '1. Can we start with only fees and attendance?',
        answer:
          'Yes. Most institutes begin with student records, fee collection, and attendance, then add examinations, library, and transport in later phases.',
        open: true,
      },
      {
        _id: new ObjectId().toString(),
        question: '2. Do you support multiple branches under one group?',
        answer:
          'The system supports central reporting with per-branch configuration, shared master data, and consolidated fee and payroll views where permitted.',
        open: false,
      },
      {
        _id: new ObjectId().toString(),
        question: '3. Is data hosted in Bangladesh or internationally?',
        answer:
          'Deployment can be on your servers, a Bangladesh cloud region where available, or a provider you approve. We document residency, backup, and DR expectations in the statement of work.',
        open: false,
      },
      {
        _id: new ObjectId().toString(),
        question: '4. How do you handle training and go-live?',
        answer:
          'We provide train-the-trainer sessions, quick-reference guides, sandbox practice, and a cutover checklist so finance and academics teams are confident before launch.',
        open: false,
      },
    ],
  }
}

function validateEducationalInstituteManagementArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === educationalInstituteManagementSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === educationalInstituteManagementSections.socials) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === educationalInstituteManagementSections.cards) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const description = typeof payload.description === 'string' ? payload.description.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    const icon = typeof payload.icon === 'string' ? payload.icon.trim() : ''
    const variant = typeof payload.variant === 'string' ? payload.variant.trim() : ''

    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if ('description' in payload || !partial) {
      value.description = description
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
    if (!partial || 'icon' in payload) {
      if (!icon) errors.push('icon is required')
      else value.icon = icon
    }
    if (!partial || 'variant' in payload) {
      if (!variant) errors.push('variant is required')
      else value.variant = variant
    }
  }

  if (section === educationalInstituteManagementSections.faqs) {
    const question = typeof payload.question === 'string' ? payload.question.trim() : ''
    const answer = typeof payload.answer === 'string' ? payload.answer.trim() : ''
    if (!partial || 'question' in payload) {
      if (!question) errors.push('question is required')
      else value.question = question
    }
    if (!partial || 'answer' in payload) {
      if (!answer) errors.push('answer is required')
      else value.answer = answer
    }
    if ('open' in payload || !partial) {
      value.open = Boolean(payload.open)
    }
  }

  if (section === educationalInstituteManagementSections.featureBullets) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  return { errors, value }
}

function getDefaultErpSoftwarePage() {
  return {
    key: 'erp-software-page',
    heroImage:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80',
    heroStripImage:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80',
    heroTitle: 'ERP Software',
    sectionTitle: 'Enterprise Resource Planning — one connected backbone',
    sectionDescription:
      'SoftEdge ERP ties finance, inventory, sales, procurement, HR, and reporting into a single source of truth. Reduce duplicate entry, close books faster, and give leadership live visibility across branches and cost centres—whether you operate locally or across regions.',
    sectionDescriptionBottom:
      'We configure workflows to match how you already work: approval chains, GST or VAT-ready documents, multi-warehouse stock, BOM for light manufacturing, and role-based dashboards for CXOs, accountants, and floor teams. Start with finance + inventory, then grow into full ERP at your pace.',
    finalDescription:
      'Security, backups, audit trails, and optional integrations (bank feeds, e-invoice, SMS, biometric attendance) are planned with your IT and finance stakeholders. Our team handles data migration workshops, UAT scripts, and hypercare after go-live.',
    stripLabel: 'ERP',
    mainServicesTitle: 'Main Services',
    brochuresTitle: 'Brochures',
    brochuresDescription:
      'Request a module map, sample reports, and a phased rollout plan tailored to your industry.',
    brochuresPrimaryButton: 'Download',
    brochuresOrLabel: 'OR',
    brochuresSecondaryButton: 'Discover',
    followUsTitle: 'Follow Us',
    serviceLinks: [
      { _id: new ObjectId().toString(), label: 'ERP Software', to: '/erp-software' },
      {
        _id: new ObjectId().toString(),
        label: 'Educational Institute Management',
        to: '/educational-institute-management',
      },
      { _id: new ObjectId().toString(), label: 'Our Services', to: '/services' },
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Mobile Platform', to: '/mobile-platform' },
      { _id: new ObjectId().toString(), label: 'Data Synchronization', to: '/data-synchronization' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
      { _id: new ObjectId().toString(), label: 'Event Processing', to: '/event-processing' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
    ],
    socials: [
      { _id: new ObjectId().toString(), label: 'f' },
      { _id: new ObjectId().toString(), label: 't' },
      { _id: new ObjectId().toString(), label: 'i' },
      { _id: new ObjectId().toString(), label: 'in' },
    ],
    cards: [
      {
        _id: new ObjectId().toString(),
        title: 'Finance & control',
        description:
          'General ledger, AR/AP, banking, fixed assets, budgeting, and management dashboards with drill-down to vouchers.',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
        icon: 'chart',
        variant: 'overlay',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Operations & integrations',
        description: '',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
        icon: 'layers',
        variant: 'footer',
      },
    ],
    featureBullets: [
      {
        _id: new ObjectId().toString(),
        text: 'Multi-company, multi-branch, multi-currency with consolidated reporting',
      },
      {
        _id: new ObjectId().toString(),
        text: 'Inventory, batch/serial, reorder levels, and transfer between warehouses',
      },
      {
        _id: new ObjectId().toString(),
        text: 'Sales orders, quotations, delivery challan, and returns linked to stock & AR',
      },
      {
        _id: new ObjectId().toString(),
        text: 'Purchase requisitions, RFQ, PO matching, GRN, and three-way match to invoices',
      },
      {
        _id: new ObjectId().toString(),
        text: 'HR & payroll basics: attendance import, leave policies, salary components',
      },
      {
        _id: new ObjectId().toString(),
        text: 'Role-based access, configurable approvals, and export to Excel / PDF',
      },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        question: '1. Can we replace spreadsheets gradually?',
        answer:
          'Yes. Many clients begin with chart of accounts, vouchers, and inventory master, then switch sales and purchase cycles module by module while historical data is imported in parallel.',
        open: true,
      },
      {
        _id: new ObjectId().toString(),
        question: '2. Do you support manufacturing or trading only?',
        answer:
          'Both. Trading focuses on purchase–sales–stock; light manufacturing adds BOM, production orders, and material consumption—we scope which objects you need in discovery.',
        open: false,
      },
      {
        _id: new ObjectId().toString(),
        question: '3. How is hosting handled?',
        answer:
          'We can deploy on your Windows/Linux servers, a VPC you control, or a managed cloud region. Backup frequency and RPO/RTO targets are written into the deployment checklist.',
        open: false,
      },
      {
        _id: new ObjectId().toString(),
        question: '4. What about training finance users?',
        answer:
          'We deliver hands-on sessions for voucher entry, month-end close, stock reconciliation, and report favourites, plus short videos for refresher after go-live.',
        open: false,
      },
    ],
  }
}

function validateErpSoftwareArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === erpSoftwareSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === erpSoftwareSections.socials) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === erpSoftwareSections.cards) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const description = typeof payload.description === 'string' ? payload.description.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    const icon = typeof payload.icon === 'string' ? payload.icon.trim() : ''
    const variant = typeof payload.variant === 'string' ? payload.variant.trim() : ''

    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if ('description' in payload || !partial) {
      value.description = description
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
    if (!partial || 'icon' in payload) {
      if (!icon) errors.push('icon is required')
      else value.icon = icon
    }
    if (!partial || 'variant' in payload) {
      if (!variant) errors.push('variant is required')
      else value.variant = variant
    }
  }

  if (section === erpSoftwareSections.faqs) {
    const question = typeof payload.question === 'string' ? payload.question.trim() : ''
    const answer = typeof payload.answer === 'string' ? payload.answer.trim() : ''
    if (!partial || 'question' in payload) {
      if (!question) errors.push('question is required')
      else value.question = question
    }
    if (!partial || 'answer' in payload) {
      if (!answer) errors.push('answer is required')
      else value.answer = answer
    }
    if ('open' in payload || !partial) {
      value.open = Boolean(payload.open)
    }
  }

  if (section === erpSoftwareSections.featureBullets) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  return { errors, value }
}

function getDefaultHospitalManagementSoftwarePage() {
  return {
    key: 'hospital-management-software-page',
    heroImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80',
    heroTitle: 'Hospital Management Software',
    stripLabel: 'HMS',
    stripImage:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80',
    stripCaption:
      'Diagnostic-ready workflows: queue management, structured orders, and traceable results — designed for busy hospitals and standalone labs alike.',
    sectionTitle: 'Clinical workflows, billing, and diagnostics — unified',
    sectionLead:
      'From front-desk registration to discharge summaries, SoftEdge HMS keeps patient journeys traceable. OPD queues, bed management, lab orders, radiology, pharmacy dispensing, and insurance claims share one patient record — fewer handoffs, fewer errors.',
    sectionSecondary:
      'Role-based screens for doctors, nurses, billing, and admin mean each team sees what matters. Built-in audit trails, configurable forms, and export-ready reports help you stay inspection-ready while focusing on care.',
    modulesEyebrow: 'Coverage',
    modulesTitle: 'Modules that mirror your hospital',
    timelineTitle: 'Why teams choose this stack',
    faqsTitle: 'Common questions',
    asideTitle: 'Explore services',
    asideBody:
      'Need security hardening, integrations, or a phased rollout plan? We map modules to your budget and go-live window.',
    asideCtaLabel: 'View all services',
    primaryCtaLabel: 'Talk to us',
    secondaryCtaLabel: 'How we work',
    serviceLinks: [
      {
        _id: new ObjectId().toString(),
        label: 'Hospital Management Software',
        to: '/hospital-management-software',
      },
      { _id: new ObjectId().toString(), label: 'ERP Software', to: '/erp-software' },
      {
        _id: new ObjectId().toString(),
        label: 'Educational Institute Management',
        to: '/educational-institute-management',
      },
      { _id: new ObjectId().toString(), label: 'Our Services', to: '/services' },
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
    ],
    stats: [
      { _id: new ObjectId().toString(), label: 'Core modules', value: '12+' },
      { _id: new ObjectId().toString(), label: 'Deployment models', value: 'Cloud / on-prem' },
      { _id: new ObjectId().toString(), label: 'Support window', value: 'SLA-based' },
    ],
    modules: [
      {
        _id: new ObjectId().toString(),
        id: 'opd',
        title: 'OPD & appointments',
        blurb: 'Token queues, doctor schedules, visit history, and e-prescriptions in one flow.',
        accent: 'from-[#00d2ff]/25 to-transparent',
      },
      {
        _id: new ObjectId().toString(),
        id: 'ipd',
        title: 'IPD & bed management',
        blurb: 'Admission, transfers, nursing notes, diet orders, and discharge planning.',
        accent: 'from-emerald-400/20 to-transparent',
      },
      {
        _id: new ObjectId().toString(),
        id: 'lab',
        title: 'Diagnostics & imaging',
        blurb: 'Lab requisitions, sample tracking, result entry, and radiology worklists.',
        accent: 'from-cyan-400/20 to-transparent',
      },
      {
        _id: new ObjectId().toString(),
        id: 'pharmacy',
        title: 'Pharmacy & inventory',
        blurb: 'Indent, batch-wise stock, expiry alerts, and POS for walk-in sales.',
        accent: 'from-sky-400/20 to-transparent',
      },
      {
        _id: new ObjectId().toString(),
        id: 'billing',
        title: 'Billing & packages',
        blurb: 'Tariff sheets, packages, insurance, deposits, and payment reconciliation.',
        accent: 'from-teal-400/20 to-transparent',
      },
      {
        _id: new ObjectId().toString(),
        id: 'hr',
        title: 'HR & duty roster',
        blurb: 'Staff master, shifts, leave, and credentialing linked to clinical access.',
        accent: 'from-[#38ddff]/20 to-transparent',
      },
    ],
    timeline: [
      {
        _id: new ObjectId().toString(),
        title: 'Single patient identifier',
        text: 'MRN-driven master data across departments — no duplicate profiles across OPD and IPD.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Configurable clinical forms',
        text: 'Vitals, SOAP notes, consent templates, and specialty-specific checklists you can evolve without code freezes.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Financial control',
        text: 'Real-time billable services, credit limits, and package utilization with manager overrides where policy allows.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Reporting & compliance',
        text: 'Daily cash, department revenue, occupancy, and stock valuation — scheduled exports to finance teams.',
      },
    ],
    spotlight: [
      {
        _id: new ObjectId().toString(),
        title: 'Patient experience',
        description:
          'Kiosk-friendly registration, SMS reminders for appointments, and clear billing summaries at discharge — reduce confusion at the counter.',
        image:
          'https://images.unsplash.com/photo-1586773860418-d372322d8195?auto=format&fit=crop&w=900&q=80',
        tag: 'Front office',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Clinical safety',
        description:
          'Allergy flags, interaction checks at pharmacy, and structured handover notes help teams coordinate during busy shifts.',
        image:
          'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=900&q=80',
        tag: 'Quality',
      },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        question: 'Can we start with OPD + billing only?',
        answer:
          'Yes. Many hospitals go live with registration, billing, and pharmacy first, then add IPD, lab, and inventory in phased milestones.',
        open: true,
      },
      {
        _id: new ObjectId().toString(),
        question: 'Does it support diagnostic centres without beds?',
        answer:
          'Absolutely. Pathology- and imaging-heavy workflows are supported with order-driven billing and report delivery.',
        open: false,
      },
      {
        _id: new ObjectId().toString(),
        question: 'How do integrations work?',
        answer:
          'We scope HL7/FHIR, PACS, payment gateways, and SMS providers during discovery so interfaces land in the right phase of your rollout.',
        open: false,
      },
    ],
    asideLinks: [
      { _id: new ObjectId().toString(), label: 'ERP Software', to: '/erp-software' },
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
    ],
  }
}

function validateHospitalManagementSoftwareArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === hospitalManagementSoftwareSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === hospitalManagementSoftwareSections.stats) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const statValue = typeof payload.value === 'string' ? payload.value.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'value' in payload) {
      if (!statValue) errors.push('value is required')
      else value.value = statValue
    }
  }

  if (section === hospitalManagementSoftwareSections.modules) {
    const moduleId = typeof payload.id === 'string' ? payload.id.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const blurb = typeof payload.blurb === 'string' ? payload.blurb.trim() : ''
    const accent = typeof payload.accent === 'string' ? payload.accent.trim() : ''
    if (!partial || 'id' in payload) {
      if (!moduleId) errors.push('id is required')
      else if (moduleId.length > 80) errors.push('id is too long')
      else value.id = moduleId
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if ('blurb' in payload || !partial) {
      value.blurb = blurb
    }
    if (!partial || 'accent' in payload) {
      if (!accent) errors.push('accent is required')
      else if (accent.length > 500) errors.push('accent is too long')
      else value.accent = accent
    }
  }

  if (section === hospitalManagementSoftwareSections.timeline) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === hospitalManagementSoftwareSections.spotlight) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const description = typeof payload.description === 'string' ? payload.description.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    const tag = typeof payload.tag === 'string' ? payload.tag.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if ('description' in payload || !partial) {
      value.description = description
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
    if (!partial || 'tag' in payload) {
      if (!tag) errors.push('tag is required')
      else value.tag = tag
    }
  }

  if (section === hospitalManagementSoftwareSections.faqs) {
    const question = typeof payload.question === 'string' ? payload.question.trim() : ''
    const answer = typeof payload.answer === 'string' ? payload.answer.trim() : ''
    if (!partial || 'question' in payload) {
      if (!question) errors.push('question is required')
      else value.question = question
    }
    if (!partial || 'answer' in payload) {
      if (!answer) errors.push('answer is required')
      else value.answer = answer
    }
    if ('open' in payload || !partial) {
      value.open = Boolean(payload.open)
    }
  }

  if (section === hospitalManagementSoftwareSections.asideLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  return { errors, value }
}

function getDefaultPharmacyManagementSoftwarePage() {
  return {
    key: 'pharmacy-management-software-page',
    heroImage:
      'https://images.unsplash.com/photo-1584308666744-24d5c474e2ae?auto=format&fit=crop&w=2000&q=80',
    heroTitle: 'Pharmacy Management Software',
    stripLabel: 'Rx',
    heroBadge: 'Pharmacy suite',
    introKicker: 'Retail & wholesale — one counter, one ledger',
    introTitle: 'Stock, compliance, and checkout without spreadsheet chaos',
    introLead:
      'SoftEdge Pharmacy ties purchase, GRN, batch-wise stock, MRP rules, and POS billing into a single flow. Whether you run one counter or branches with central purchase, teams see the same truth on expiry, slow movers, and margin.',
    introSecondary:
      'Doctor-wise or patient-wise selling, schedule drug controls, and GST-ready invoices are configurable to how your pharmacy already operates — we help you migrate masters and opening stock with minimal downtime.',
    introAside:
      'Built for high-SKU counters — fast lookup, fewer wrong picks, clearer handover between shifts.',
    capabilitiesEyebrow: 'Deep dive',
    capabilitiesTitle: 'What the suite actually covers',
    honeycombTitle: 'Modules at a glance',
    honeycombLead:
      'Pick what you need first — POS and stock for day one, then wholesale slabs, reminders, and owner analytics as you grow.',
    faqsTitle: 'Questions teams ask first',
    primaryCtaLabel: 'Talk to us',
    secondaryCtaLabel: 'How we work',
    serviceLinks: [
      {
        _id: new ObjectId().toString(),
        label: 'Pharmacy Management Software',
        to: '/pharmacy-management-software',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Hospital Management Software',
        to: '/hospital-management-software',
      },
      { _id: new ObjectId().toString(), label: 'ERP Software', to: '/erp-software' },
      { _id: new ObjectId().toString(), label: 'Our Services', to: '/services' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
    ],
    highlights: [
      {
        _id: new ObjectId().toString(),
        label: 'Batch & expiry',
        detail: 'FEFO picks, near-expiry alerts, and recall notes per batch.',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Purchase to POS',
        detail: 'Indent, PO, GRN, sales, returns — linked stock ledger.',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Compliance ready',
        detail: 'Schedule templates, audit log, and role-based counters.',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Insight',
        detail: 'ABC analysis, margin by category, and dead-stock nudges.',
      },
    ],
    capabilities: [
      {
        _id: new ObjectId().toString(),
        n: '01',
        title: 'Master data that pharmacists trust',
        text: 'Salt / brand mapping, generics, strengths, forms, and rack-bin locations. Barcode and SKU rules for fast search at billing.',
      },
      {
        _id: new ObjectId().toString(),
        n: '02',
        title: 'Billing tuned for counters',
        text: 'Split MRP & discount lines, schemes, loyalty, and thermal or A4 invoices. Hold bills, home delivery tags, and credit limits for trusted accounts.',
      },
      {
        _id: new ObjectId().toString(),
        n: '03',
        title: 'Inventory that matches real shelves',
        text: 'Multi-location stock, inter-branch transfers, physical stock reconciliation worksheets, and auto-suggestions for reorder based on sales velocity.',
      },
      {
        _id: new ObjectId().toString(),
        n: '04',
        title: 'Finance & dues in one view',
        text: 'Supplier outstanding, GRN-linked payments, cash-up summaries, and bank deposit tags — export friendly for your accountant.',
      },
    ],
    honeycomb: [
      { _id: new ObjectId().toString(), id: 'pos', title: 'POS', sub: 'Touch-friendly billing' },
      { _id: new ObjectId().toString(), id: 'rx', title: 'e-Rx', sub: 'Upload & attach' },
      { _id: new ObjectId().toString(), id: 'gst', title: 'GST', sub: 'HSN & e-invoice' },
      { _id: new ObjectId().toString(), id: 'wh', title: 'Wholesale', sub: 'Rate slabs' },
      { _id: new ObjectId().toString(), id: 'mob', title: 'Mobile', sub: 'Owner dashboards' },
      { _id: new ObjectId().toString(), id: 'sms', title: 'SMS', sub: 'Pickup reminders' },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        question: 'Can we keep selling while data is imported?',
        answer:
          'Yes. We usually parallel-run critical SKUs first, then widen coverage while counters stay on your legacy till cut-over weekend.',
        open: false,
      },
      {
        _id: new ObjectId().toString(),
        question: 'Do you support chain stores?',
        answer:
          'Multi-branch with central purchase and local sales is supported; visibility rules decide who sees group-wide stock.',
        open: false,
      },
      {
        _id: new ObjectId().toString(),
        question: 'What hardware works at the counter?',
        answer:
          'Common thermal printers, barcode scanners, cash drawers, and weighing scales are integrated where scope includes retail packaging.',
        open: false,
      },
    ],
  }
}

function validatePharmacyManagementSoftwareArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === pharmacyManagementSoftwareSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === pharmacyManagementSoftwareSections.highlights) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'detail' in payload) {
      if (!detail) errors.push('detail is required')
      else value.detail = detail
    }
  }

  if (section === pharmacyManagementSoftwareSections.capabilities) {
    const n = typeof payload.n === 'string' ? payload.n.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'n' in payload) {
      if (!n) errors.push('n is required')
      else if (n.length > 12) errors.push('n is too long')
      else value.n = n
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === pharmacyManagementSoftwareSections.honeycomb) {
    const cellId = typeof payload.id === 'string' ? payload.id.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const sub = typeof payload.sub === 'string' ? payload.sub.trim() : ''
    if (!partial || 'id' in payload) {
      if (!cellId) errors.push('id is required')
      else if (cellId.length > 40) errors.push('id is too long')
      else value.id = cellId
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'sub' in payload) {
      if (!sub) errors.push('sub is required')
      else value.sub = sub
    }
  }

  if (section === pharmacyManagementSoftwareSections.faqs) {
    const question = typeof payload.question === 'string' ? payload.question.trim() : ''
    const answer = typeof payload.answer === 'string' ? payload.answer.trim() : ''
    if (!partial || 'question' in payload) {
      if (!question) errors.push('question is required')
      else value.question = question
    }
    if (!partial || 'answer' in payload) {
      if (!answer) errors.push('answer is required')
      else value.answer = answer
    }
    if ('open' in payload || !partial) {
      value.open = Boolean(payload.open)
    }
  }

  return { errors, value }
}

function getDefaultRestaurantManagementSoftwarePage() {
  return {
    key: 'restaurant-management-software-page',
    heroImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=80',
    heroTitle: 'Restaurant Management Software',
    heroLead:
      'Table service, kitchen coordination, inventory, and billing in one live command center for fast-growing restaurants.',
    heroBadge: 'Dine in. Takeaway. Delivery.',
    coreTitle: 'One platform across front-of-house and back-of-house',
    coreBody:
      'SoftEdge Restaurant Suite connects waiters, kitchen, cashier, and owner dashboards. Orders route instantly, modifiers stay attached, and every sale updates stock usage and cash counters in real time.',
    serviceLinks: [
      {
        _id: new ObjectId().toString(),
        label: 'Restaurant Management Software',
        to: '/restaurant-management-software',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Hospital Management Software',
        to: '/hospital-management-software',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Pharmacy Management Software',
        to: '/pharmacy-management-software',
      },
      { _id: new ObjectId().toString(), label: 'ERP Software', to: '/erp-software' },
      { _id: new ObjectId().toString(), label: 'Our Services', to: '/services' },
    ],
    topPills: [
      { _id: new ObjectId().toString(), label: 'Cloud POS', value: 'Real-time sync' },
      { _id: new ObjectId().toString(), label: 'Kitchen Display', value: 'Ticket prioritization' },
      { _id: new ObjectId().toString(), label: 'Inventory', value: 'Recipe-level control' },
      { _id: new ObjectId().toString(), label: 'Reports', value: 'Hour-by-hour sales' },
    ],
    modules: [
      {
        _id: new ObjectId().toString(),
        code: '01',
        title: 'Smart POS & billing',
        text: 'Fast menu search, split bills, discounts, tax rules, and payment mix (cash, card, mobile wallets).',
      },
      {
        _id: new ObjectId().toString(),
        code: '02',
        title: 'Table & reservation flow',
        text: 'Visual floor map, booking slots, waitlist handling, and quick table merge or transfer.',
      },
      {
        _id: new ObjectId().toString(),
        code: '03',
        title: 'Kitchen display system',
        text: 'Category-wise KOT routing, prep timers, rush alerts, and delayed-item escalation.',
      },
      {
        _id: new ObjectId().toString(),
        code: '04',
        title: 'Recipe inventory',
        text: 'Ingredient-level consumption, wastage tracking, low-stock triggers, and purchase planning.',
      },
    ],
    spotlight: [
      {
        _id: new ObjectId().toString(),
        title: 'Table Experience That Feels Premium',
        body: 'From QR menu to order confirmation, guests get a smooth dine-in journey while staff track requests in real time without missed items.',
        tag: 'Front of House',
        image:
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Kitchen Operations Without Bottlenecks',
        body: 'Live kitchen queues, prep timers, and section-based routing keep chefs focused while managers monitor delays and throughput instantly.',
        tag: 'Back of House',
        image:
          'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    timeline: [
      {
        _id: new ObjectId().toString(),
        title: 'Order taken',
        text: 'Dine-in, parcel, and delivery orders captured from one screen.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Kitchen sync',
        text: 'KOT auto-routes to kitchen sections with modifiers and notes.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Service complete',
        text: 'Status updates return to waiter/cashier with no manual calls.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Bill closed',
        text: 'Payment, tips, and taxes posted with stock and sales reports updated.',
      },
    ],
    stats: [
      { _id: new ObjectId().toString(), label: 'Order channels', value: '3 in 1' },
      { _id: new ObjectId().toString(), label: 'Menu updates', value: 'Live' },
      { _id: new ObjectId().toString(), label: 'Owner visibility', value: '24/7' },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        q: 'Can we use this for multiple branches?',
        a: 'Yes. Branch-wise menus, pricing, user access, and consolidated reporting are supported from one admin panel.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Does it support food delivery workflows?',
        a: 'Yes. Dedicated delivery order flow, rider assignment tags, and channel-wise sales tracking are included.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Can we start small and scale later?',
        a: 'Absolutely. Most teams start with POS + kitchen + inventory, then add loyalty, CRM, and branch controls.',
      },
    ],
  }
}

function validateRestaurantManagementSoftwareArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === restaurantManagementSoftwareSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === restaurantManagementSoftwareSections.topPills) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const pillValue = typeof payload.value === 'string' ? payload.value.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'value' in payload) {
      if (!pillValue) errors.push('value is required')
      else value.value = pillValue
    }
  }

  if (section === restaurantManagementSoftwareSections.modules) {
    const code = typeof payload.code === 'string' ? payload.code.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'code' in payload) {
      if (!code) errors.push('code is required')
      else if (code.length > 20) errors.push('code is too long')
      else value.code = code
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === restaurantManagementSoftwareSections.spotlight) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const body = typeof payload.body === 'string' ? payload.body.trim() : ''
    const tag = typeof payload.tag === 'string' ? payload.tag.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'body' in payload) {
      if (!body) errors.push('body is required')
      else value.body = body
    }
    if (!partial || 'tag' in payload) {
      if (!tag) errors.push('tag is required')
      else value.tag = tag
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
  }

  if (section === restaurantManagementSoftwareSections.timeline) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === restaurantManagementSoftwareSections.stats) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const statValue = typeof payload.value === 'string' ? payload.value.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'value' in payload) {
      if (!statValue) errors.push('value is required')
      else value.value = statValue
    }
  }

  if (section === restaurantManagementSoftwareSections.faqs) {
    const q = typeof payload.q === 'string' ? payload.q.trim() : ''
    const a = typeof payload.a === 'string' ? payload.a.trim() : ''
    if (!partial || 'q' in payload) {
      if (!q) errors.push('q is required')
      else value.q = q
    }
    if (!partial || 'a' in payload) {
      if (!a) errors.push('a is required')
      else value.a = a
    }
  }

  return { errors, value }
}

function getDefaultInventoryManagementSoftwarePage() {
  return {
    key: 'inventory-management-software-page',
    heroImage:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2200&q=80',
    heroTitle: 'Inventory Management Software',
    heroLead:
      'Track stock movement, automate replenishment, and control warehouse operations with one intelligent inventory platform.',
    heroBadge: 'Stock. Control. Visibility.',
    serviceLinks: [
      {
        _id: new ObjectId().toString(),
        label: 'Inventory Management Software',
        to: '/inventory-management-software',
      },
      { _id: new ObjectId().toString(), label: 'ERP Software', to: '/erp-software' },
      {
        _id: new ObjectId().toString(),
        label: 'Hospital Management Software',
        to: '/hospital-management-software',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Restaurant Management Software',
        to: '/restaurant-management-software',
      },
      { _id: new ObjectId().toString(), label: 'Our Services', to: '/services' },
    ],
    overviewCards: [
      {
        _id: new ObjectId().toString(),
        title: 'Live Stock Ledger',
        text: 'Batch-wise, SKU-wise, and location-wise stock updates in real time.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Smart Reorder',
        text: 'Auto reorder points based on demand pattern and lead time.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Audit Trail',
        text: 'Every stock in/out, transfer, and correction stays fully traceable.',
      },
    ],
    operationsFlow: [
      {
        _id: new ObjectId().toString(),
        step: 'Step 01',
        title: 'Goods Receive Note (GRN)',
        text: 'Capture inbound stock with supplier reference, batch details, and quality checkpoints.',
      },
      {
        _id: new ObjectId().toString(),
        step: 'Step 02',
        title: 'Bin Allocation & Putaway',
        text: 'Assign SKUs to optimized rack/bin locations for faster retrieval and fewer picking errors.',
      },
      {
        _id: new ObjectId().toString(),
        step: 'Step 03',
        title: 'Order Fulfillment',
        text: 'Create pick list, validate packed quantities, and update stock ledger automatically.',
      },
      {
        _id: new ObjectId().toString(),
        step: 'Step 04',
        title: 'Cycle Count & Reconciliation',
        text: 'Run periodic counts, detect variances, and maintain audit-ready adjustments.',
      },
    ],
    integrationGrid: [
      {
        _id: new ObjectId().toString(),
        label: 'POS Systems',
        detail: 'Sales sync to inventory in real time',
      },
      {
        _id: new ObjectId().toString(),
        label: 'ERP & Finance',
        detail: 'Purchase, stock value, and COGS alignment',
      },
      {
        _id: new ObjectId().toString(),
        label: 'E-commerce',
        detail: 'Live availability across online channels',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Barcode Devices',
        detail: 'Faster GRN, transfers, and stock count',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Delivery Modules',
        detail: 'Dispatch status with item-level tracking',
      },
      {
        _id: new ObjectId().toString(),
        label: 'Analytics Layer',
        detail: 'Demand forecasting and reorder intelligence',
      },
    ],
    outcomes: [
      {
        _id: new ObjectId().toString(),
        title: 'Lower stock leakage',
        text: 'Role-based approvals and movement tracking reduce unauthorized adjustments.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Faster warehouse response',
        text: 'Structured receiving and pick workflows reduce operational delays.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Better planning accuracy',
        text: 'Historical consumption with lead-time awareness improves procurement decisions.',
      },
    ],
    capabilities: [
      {
        _id: new ObjectId().toString(),
        id: 'A1',
        heading: 'Multi-warehouse control',
        detail: 'Central view with warehouse-specific permissions and transfer approvals.',
      },
      {
        _id: new ObjectId().toString(),
        id: 'A2',
        heading: 'Barcode & QR support',
        detail: 'Fast scanning for receiving, picking, cycle counts, and retail dispatch.',
      },
      {
        _id: new ObjectId().toString(),
        id: 'A3',
        heading: 'Dead stock insights',
        detail: 'Slow movers, overstock risk, and aging inventory alerts with action suggestions.',
      },
      {
        _id: new ObjectId().toString(),
        id: 'A4',
        heading: 'Purchase coordination',
        detail: 'Vendor-wise rates, pending POs, and GRN mismatch visibility for finance teams.',
      },
    ],
    metrics: [
      { _id: new ObjectId().toString(), value: '99.9%', label: 'Stock accuracy target' },
      { _id: new ObjectId().toString(), value: '24/7', label: 'Owner dashboard visibility' },
      { _id: new ObjectId().toString(), value: '∞', label: 'Scalable SKU handling' },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        question: 'Can we manage multiple warehouses and outlets?',
        answer:
          'Yes. You can manage central warehouse, branches, and counters from one system with role-based access.',
      },
      {
        _id: new ObjectId().toString(),
        question: 'Does this support barcode-based operations?',
        answer:
          'Yes. Receiving, transfer, stock count, and dispatch can all be performed with barcode/QR scanning.',
      },
      {
        _id: new ObjectId().toString(),
        question: 'Can we integrate with billing or ERP later?',
        answer:
          'Absolutely. The inventory modules are designed for phased integration with POS, accounting, and ERP workflows.',
      },
    ],
  }
}

function validateInventoryManagementSoftwareArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === inventoryManagementSoftwareSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === inventoryManagementSoftwareSections.overviewCards || section === inventoryManagementSoftwareSections.outcomes) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === inventoryManagementSoftwareSections.operationsFlow) {
    const step = typeof payload.step === 'string' ? payload.step.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'step' in payload) {
      if (!step) errors.push('step is required')
      else value.step = step
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === inventoryManagementSoftwareSections.integrationGrid) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'detail' in payload) {
      if (!detail) errors.push('detail is required')
      else value.detail = detail
    }
  }

  if (section === inventoryManagementSoftwareSections.capabilities) {
    const capId = typeof payload.id === 'string' ? payload.id.trim() : ''
    const heading = typeof payload.heading === 'string' ? payload.heading.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
    if (!partial || 'id' in payload) {
      if (!capId) errors.push('id is required')
      else if (capId.length > 20) errors.push('id is too long')
      else value.id = capId
    }
    if (!partial || 'heading' in payload) {
      if (!heading) errors.push('heading is required')
      else value.heading = heading
    }
    if (!partial || 'detail' in payload) {
      if (!detail) errors.push('detail is required')
      else value.detail = detail
    }
  }

  if (section === inventoryManagementSoftwareSections.metrics) {
    const valueText = typeof payload.value === 'string' ? payload.value.trim() : ''
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'value' in payload) {
      if (!valueText) errors.push('value is required')
      else value.value = valueText
    }
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === inventoryManagementSoftwareSections.faqs) {
    const question = typeof payload.question === 'string' ? payload.question.trim() : ''
    const answer = typeof payload.answer === 'string' ? payload.answer.trim() : ''
    if (!partial || 'question' in payload) {
      if (!question) errors.push('question is required')
      else value.question = question
    }
    if (!partial || 'answer' in payload) {
      if (!answer) errors.push('answer is required')
      else value.answer = answer
    }
  }

  return { errors, value }
}

function getDefaultEventProcessingPage() {
  return {
    key: 'event-processing-page',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    leftImage:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80',
    rightImage:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    heroTitle: 'Event Processing',
    sectionTitle: 'Event Processing',
    sectionDescription:
      'Event processing helps teams react instantly to system activities and user actions. We design robust event flows for real-time analytics, automation triggers, and reliable outcomes.',
    leftColumnText:
      'It is a long established fact that a reader will be distracted by the readable content of a page. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
    benefitsSectionTitle: 'Our work benefits',
    benefitsSectionDescription:
      'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which do not look even slightly believable.',
    benefitReadMoreLabel: 'Read more →',
    mainServicesTitle: 'Main Services',
    brochuresTitle: 'Brochures',
    brochuresDescription:
      'Cras enim urna, interdum nec porttitor vitae, sollicitudin eu eros. Praesent eget mollis nulla.',
    brochuresPrimaryButton: 'Download',
    brochuresOrLabel: 'OR',
    brochuresSecondaryButton: 'Discover',
    followUsTitle: 'Follow Us',
    serviceLinks: [
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Mobile Platforms', to: '/mobile-platform' },
      { _id: new ObjectId().toString(), label: 'Data Synchronization', to: '/data-synchronization' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
      { _id: new ObjectId().toString(), label: 'Event Processing', to: '/event-processing' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
    ],
    socials: [
      { _id: new ObjectId().toString(), label: 'f' },
      { _id: new ObjectId().toString(), label: 't' },
      { _id: new ObjectId().toString(), label: 'i' },
      { _id: new ObjectId().toString(), label: 'in' },
    ],
    checklist: [
      { _id: new ObjectId().toString(), text: 'Marketing options and rates' },
      { _id: new ObjectId().toString(), text: 'The ability to turnaround consulting' },
      { _id: new ObjectId().toString(), text: 'Research beyond the business plan' },
      { _id: new ObjectId().toString(), text: 'Customer engagement matters' },
    ],
    benefits: [
      {
        _id: new ObjectId().toString(),
        title: 'Information Security',
        text: 'We focus on the best practices for IT solutions and services.',
        icon: '🛡️',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Mobile Platforms',
        text: 'We focus on the best practices for IT solutions and services.',
        icon: '📱',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Data Synchronization',
        text: 'We focus on the best practices for IT solutions and services.',
        icon: '🔄',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Process Automation',
        text: 'We focus on the best practices for IT solutions and services.',
        icon: '⚙️',
      },
    ],
  }
}

function getDefaultMunicipalityUnionManagementPage() {
  return {
    key: 'municipality-union-management-page',
    heroImage:
      'https://images.unsplash.com/photo-1577493340887-b7bfff550145?auto=format&fit=crop&w=2200&q=80',
    heroBadge: 'Smart Governance',
    heroTitle: 'Municipality / Union Management',
    heroLead:
      'Digitize citizen services, tax collection, social safety operations, and administrative workflows with one connected e-governance platform.',
    serviceLinks: [
      {
        _id: new ObjectId().toString(),
        label: 'Municipality / Union Management',
        to: '/municipality-union-management',
      },
      { _id: new ObjectId().toString(), label: 'Our Services', to: '/services' },
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
      { _id: new ObjectId().toString(), label: 'Event Processing', to: '/event-processing' },
    ],
    civicModules: [
      {
        _id: new ObjectId().toString(),
        title: 'Citizen Service Desk',
        text: 'Application intake, certificate issuance, trade license flow, and digital tracking in one queue.',
        icon: 'Office',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Revenue & Tax Collection',
        text: 'Holding tax, water bills, market rent, and due notices with payment status visibility.',
        icon: 'Payment',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Social Safety Net',
        text: 'Beneficiary enlistment, eligibility checks, and distribution audit trail by ward or village.',
        icon: 'Support',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Village Court & Complaints',
        text: 'Case registration, hearing schedule, order notes, and status updates for citizens.',
        icon: 'Justice',
      },
    ],
    processTimeline: [
      {
        _id: new ObjectId().toString(),
        step: 'Phase 01',
        title: 'Citizen Request Submission',
        text: 'Requests are received from front desk, agent point, or online form with instant token creation.',
      },
      {
        _id: new ObjectId().toString(),
        step: 'Phase 02',
        title: 'Field Validation & Approval',
        text: 'Assigned officials verify data and complete role-based approvals with full action history.',
      },
      {
        _id: new ObjectId().toString(),
        step: 'Phase 03',
        title: 'Fee, Tax & Payment Reconciliation',
        text: 'System generates payable amounts and syncs all transactions with treasury and finance records.',
      },
      {
        _id: new ObjectId().toString(),
        step: 'Phase 04',
        title: 'Document Delivery & Reporting',
        text: 'Approved documents are delivered while dashboards show ward-wise service performance and backlog.',
      },
    ],
    performanceCards: [
      { _id: new ObjectId().toString(), label: 'Citizen Requests Tracked', value: '50K+' },
      { _id: new ObjectId().toString(), label: 'Average Process Reduction', value: '60%' },
      { _id: new ObjectId().toString(), label: 'Revenue Visibility', value: '100%' },
      { _id: new ObjectId().toString(), label: 'Digital Record Confidence', value: '99.9%' },
    ],
    governanceFeatures: [
      { _id: new ObjectId().toString(), text: 'Ward/Area wise population and household registry' },
      { _id: new ObjectId().toString(), text: 'Birth, death, marriage and inheritance certificate workflow' },
      { _id: new ObjectId().toString(), text: 'Trade license issue, renewal and arrear tracking' },
      { _id: new ObjectId().toString(), text: 'Tender notice, procurement and project progress board' },
      { _id: new ObjectId().toString(), text: 'Employee attendance, movement log and payroll handoff' },
      {
        _id: new ObjectId().toString(),
        text: 'Unified analytics dashboard for chairman, mayor and secretary',
      },
    ],
    faq: [
      {
        _id: new ObjectId().toString(),
        q: 'Can this platform work for both municipality and union parishad?',
        a: 'Yes. The platform supports both structures with configurable service modules, naming, and role hierarchy.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Does it support Bangla-friendly citizen-facing operations?',
        a: 'Yes. Core forms, service labels, and printable outputs can be configured for Bangla and English usage.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Can it integrate payment gateway later?',
        a: 'Absolutely. The billing and reconciliation layer is designed to connect with gateway, wallet, or bank APIs.',
      },
    ],
  }
}

function getDefaultPaymentGatewaysPage() {
  return {
    key: 'payment-gateways-page',
    heroImage:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=2200&q=80',
    heroBadge: 'FinTech Infrastructure',
    heroTitle: 'Payment Gateways & Digital Wallets',
    heroLead:
      'Launch secure, scalable payment experiences with wallet operations, merchant onboarding, settlement intelligence, and fraud-aware transaction controls.',
    heroStats: [
      { _id: new ObjectId().toString(), value: '120M+', label: 'Yearly transactions processed' },
      { _id: new ObjectId().toString(), value: '35+', label: 'Integrated banks and processors' },
      { _id: new ObjectId().toString(), value: '9', label: 'Risk engines in one pipeline' },
    ],
    serviceLinks: [
      { _id: new ObjectId().toString(), label: 'Payment Gateways & Digital Wallets', to: '/payment-gateways' },
      {
        _id: new ObjectId().toString(),
        label: 'Municipality / Union Management',
        to: '/municipality-union-management',
      },
      { _id: new ObjectId().toString(), label: 'ERP Software', to: '/erp-software' },
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Our Services', to: '/services' },
    ],
    rails: [
      {
        _id: new ObjectId().toString(),
        title: 'Checkout Orchestration',
        text: 'Route transactions by bank, method, and risk score to maximize approval rate.',
        gradient: 'from-[#00d2ff]/45 to-[#1b6ea1]/35',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Wallet Ledger Engine',
        text: 'Credit/debit, reversal, hold, release, and statement generation with immutable history.',
        gradient: 'from-[#00c17c]/35 to-[#0a4d64]/35',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Merchant Settlement',
        text: 'Automated T+0/T+1 settlement, fee split, and payout file generation.',
        gradient: 'from-[#7a6bff]/35 to-[#13395b]/35',
      },
    ],
    partnerChannels: [
      {
        _id: new ObjectId().toString(),
        name: 'Card Networks',
        detail: 'Visa, Mastercard, local schemes, tokenized rails',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Wallet Partners',
        detail: 'App wallets, telco wallets, super app ecosystems',
      },
      {
        _id: new ObjectId().toString(),
        name: 'QR & NFC',
        detail: 'Static/dynamic QR and contactless acceptance flows',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Bank Transfers',
        detail: 'Instant transfer, scheduled payout, virtual accounts',
      },
    ],
    flowSteps: [
      {
        _id: new ObjectId().toString(),
        phase: '01',
        title: 'User Pays',
        text: 'Customer completes payment through card, wallet, QR, or transfer.',
      },
      {
        _id: new ObjectId().toString(),
        phase: '02',
        title: 'Risk Check',
        text: 'Real-time fraud filters and velocity rules evaluate transaction health.',
      },
      {
        _id: new ObjectId().toString(),
        phase: '03',
        title: 'Authorization',
        text: 'Smart routing sends request to best processor/bank channel.',
      },
      {
        _id: new ObjectId().toString(),
        phase: '04',
        title: 'Settlement',
        text: 'Funds are reconciled and settled to merchant and platform wallets.',
      },
    ],
    riskLayers: [
      {
        _id: new ObjectId().toString(),
        id: 'R1',
        title: 'Device fingerprinting',
        text: 'Detect unusual device swaps and emulator activity.',
      },
      {
        _id: new ObjectId().toString(),
        id: 'R2',
        title: 'Behavior intelligence',
        text: 'Model transaction rhythm, amount spikes, and geo mismatch.',
      },
      {
        _id: new ObjectId().toString(),
        id: 'R3',
        title: 'Rule orchestration',
        text: 'Allow, challenge, queue, or block with policy-based routing.',
      },
      {
        _id: new ObjectId().toString(),
        id: 'R4',
        title: 'Case management',
        text: 'Fraud review board with annotated timelines and outcomes.',
      },
    ],
    walletCapabilities: [
      {
        _id: new ObjectId().toString(),
        code: 'W1',
        heading: 'KYC & account tiers',
        detail: 'Support onboarding tiers with configurable limits.',
      },
      {
        _id: new ObjectId().toString(),
        code: 'W2',
        heading: 'Cash in / cash out',
        detail: 'Agent, bank, and API-assisted top-up and withdrawal flows.',
      },
      {
        _id: new ObjectId().toString(),
        code: 'W3',
        heading: 'Bill & utility payments',
        detail: 'Single dashboard for recurring and one-time payment services.',
      },
      {
        _id: new ObjectId().toString(),
        code: 'W4',
        heading: 'Refund & dispute handling',
        detail: 'Traceable dispute states with SLA timers and audit notes.',
      },
    ],
    metrics: [
      { _id: new ObjectId().toString(), value: '99.95%', label: 'Transaction uptime target' },
      { _id: new ObjectId().toString(), value: '< 1.8s', label: 'Average payment response' },
      { _id: new ObjectId().toString(), value: '24/7', label: 'Monitoring & alerts' },
    ],
    businessUseCases: [
      {
        _id: new ObjectId().toString(),
        title: 'E-commerce checkout',
        text: 'Improve conversion with one-click cards, saved instruments, and retry routing.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Utility and bill payment',
        text: 'Handle recurring bills, reminders, and due-tracking in a wallet-first flow.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Agent cash operations',
        text: 'Branch and agent-assisted cash-in/cash-out with role-based limits.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Marketplace settlement',
        text: 'Split payments by merchant, commission, tax, and delayed release.',
      },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        q: 'Can this support both gateway and wallet in one platform?',
        a: 'Yes. The architecture supports processor integrations and full wallet lifecycle in one control panel.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Do you provide fraud and reconciliation modules?',
        a: 'Yes. We provide rule-based fraud checks, transaction traceability, and auto reconciliation workflows.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Can we start with gateway first and add wallet later?',
        a: 'Absolutely. Modules are deployment-ready in phases so you can scale from gateway to full fintech stack.',
      },
    ],
  }
}

function getDefaultWebsiteDevelopmentPage() {
  return {
    key: 'website-development-page',
    heroImage:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=2200&q=80',
    eyebrow: 'Creative Web Studio',
    title: 'Website Design & Development',
    subtitle:
      'We craft brand-first, conversion-ready websites with modern engineering, clean architecture, and measurable growth outcomes.',
    introPoints: [
      { _id: new ObjectId().toString(), text: 'SEO-friendly architecture with semantic markup and clean URL patterns' },
      { _id: new ObjectId().toString(), text: 'Responsive UI across desktop, tablet, and mobile with accessibility-first layout' },
      { _id: new ObjectId().toString(), text: 'Fast-loading pages with image optimization, caching strategy, and code splitting' },
      { _id: new ObjectId().toString(), text: 'Analytics-ready deployment so you can track leads, clicks, and conversion funnels' },
    ],
    quickLinks: [
      { _id: new ObjectId().toString(), label: 'Website Design & Development', to: '/website-development' },
      { _id: new ObjectId().toString(), label: 'Landing Page Design', to: '/services' },
      { _id: new ObjectId().toString(), label: 'E-commerce & News Portal', to: '/services' },
      { _id: new ObjectId().toString(), label: 'Domain & Hosting', to: '/services' },
    ],
    designPillars: [
      {
        _id: new ObjectId().toString(),
        name: 'Visual Identity',
        detail: 'Brand-driven UI system, typography, spacing rhythm, and interaction language.',
      },
      {
        _id: new ObjectId().toString(),
        name: 'User Journey',
        detail: 'Clear content hierarchy, CTA placement, and frictionless conversion paths.',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Engineering Quality',
        detail: 'Reusable components, clean code, and scalable deployment strategy.',
      },
    ],
    deliveryTracks: [
      {
        _id: new ObjectId().toString(),
        track: 'Track 01',
        title: 'Discovery & Wireframe',
        text: 'Audience map, goal architecture, and low-fidelity blueprint.',
      },
      {
        _id: new ObjectId().toString(),
        track: 'Track 02',
        title: 'UI Design & Prototype',
        text: 'High-fidelity visual system with animated click-through prototypes.',
      },
      {
        _id: new ObjectId().toString(),
        track: 'Track 03',
        title: 'Development Sprint',
        text: 'Responsive frontend, CMS/API integration, and performance tuning.',
      },
      {
        _id: new ObjectId().toString(),
        track: 'Track 04',
        title: 'Launch & Optimization',
        text: 'SEO baseline, analytics setup, and post-launch conversion iteration.',
      },
    ],
    packageGrid: [
      { _id: new ObjectId().toString(), type: 'Starter Site', scope: 'Corporate profile', eta: '7-10 days', price: 'From $250' },
      { _id: new ObjectId().toString(), type: 'Growth Site', scope: 'Dynamic CMS pages', eta: '2-3 weeks', price: 'From $700' },
      { _id: new ObjectId().toString(), type: 'Commerce Site', scope: 'Product + checkout', eta: '3-5 weeks', price: 'From $1200' },
      { _id: new ObjectId().toString(), type: 'Custom Build', scope: 'Complex portal/SaaS', eta: 'By scope', price: 'Custom quote' },
    ],
    serviceDetails: [
      {
        _id: new ObjectId().toString(),
        title: 'UI/UX Strategy',
        text: 'From content hierarchy to wireframe and clickable prototypes, we validate user flow before development starts.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Custom Frontend Development',
        text: 'Pixel-perfect components, motion interactions, reusable sections, and scalable code structure for future growth.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Backend & CMS Integration',
        text: 'Dynamic content control, API integration, admin-ready setup, and secure data handling for production usage.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Launch & Growth Support',
        text: 'Deployment, QA, SEO baseline, analytics setup, and iterative improvements after launch.',
      },
    ],
    projectShowcase: [
      {
        _id: new ObjectId().toString(),
        name: 'SoftEdge Corporate Website',
        category: 'Corporate / IT Services',
        summary: 'Modern company profile website with service funnels, team page, and lead generation flow.',
        liveLink: 'https://example.com/softedge-corporate',
        githubLink: 'https://github.com/example/softedge-corporate',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        tech: ['React', 'Tailwind', 'Node.js'],
      },
      {
        _id: new ObjectId().toString(),
        name: 'NovaShop E-commerce',
        category: 'E-commerce',
        summary: 'Product catalog, cart/checkout journey, payment integration, and order management dashboard.',
        liveLink: 'https://example.com/novashop',
        githubLink: 'https://github.com/example/novashop',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
        tech: ['React', 'Express', 'MongoDB'],
      },
      {
        _id: new ObjectId().toString(),
        name: 'DailyNews Portal',
        category: 'News & Media',
        summary: 'High-content publishing portal with category-based routing, trending widgets, and admin posting tools.',
        liveLink: 'https://example.com/dailynews',
        githubLink: 'https://github.com/example/dailynews',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        tech: ['Next.js', 'API', 'Cloud CDN'],
      },
    ],
    stack: [
      { _id: new ObjectId().toString(), text: 'React' },
      { _id: new ObjectId().toString(), text: 'Node.js' },
      { _id: new ObjectId().toString(), text: 'MongoDB' },
      { _id: new ObjectId().toString(), text: 'WordPress' },
      { _id: new ObjectId().toString(), text: 'Tailwind CSS' },
      { _id: new ObjectId().toString(), text: 'Cloud Hosting' },
    ],
    stats: [
      { _id: new ObjectId().toString(), value: '120+', label: 'Web projects delivered' },
      { _id: new ObjectId().toString(), value: '96%', label: 'Client satisfaction rate' },
      { _id: new ObjectId().toString(), value: '90+', label: 'Lighthouse performance target' },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        q: 'Can you redesign our existing website without losing SEO?',
        a: 'Yes. We preserve URL strategy, set redirects, and apply technical SEO checks during migration.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Will the site be editable by our internal team?',
        a: 'Absolutely. We provide CMS controls and training so your team can update content independently.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Do you offer maintenance after launch?',
        a: 'Yes. We provide monthly maintenance plans including updates, backups, and performance monitoring.',
      },
    ],
  }
}

function getDefaultLandingPageDesignPage() {
  return {
    key: 'landing-page-design-page',
    heroImage:
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=2200&q=80',
    badge: 'Conversion-Centric Design',
    title: 'Landing Page Design',
    subtitle:
      'Build high-performing landing pages that turn clicks into leads, signups, and sales with strategy-led messaging and sharp visual storytelling.',
    quickActions: [
      { _id: new ObjectId().toString(), label: 'Landing Page Design', to: '/landing-page-design' },
      { _id: new ObjectId().toString(), label: 'Website Design & Development', to: '/website-development' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
      { _id: new ObjectId().toString(), label: 'Our Services', to: '/services' },
    ],
    campaignTypes: [
      {
        _id: new ObjectId().toString(),
        type: 'Lead Generation',
        detail: 'Service inquiry, form capture, and consultation booking focused pages.',
        accent: 'from-[#00d2ff]/45 to-[#0c4d75]/45',
      },
      {
        _id: new ObjectId().toString(),
        type: 'Product Launch',
        detail: 'Feature spotlight, urgency blocks, social proof, and CTA sequencing.',
        accent: 'from-[#1fa2ff]/35 to-[#12507a]/35',
      },
      {
        _id: new ObjectId().toString(),
        type: 'Webinar/Event Signup',
        detail: 'Speaker highlights, schedule modules, and conversion-friendly registration flow.',
        accent: 'from-[#00b09b]/35 to-[#0b5c66]/35',
      },
      {
        _id: new ObjectId().toString(),
        type: 'App Download',
        detail: 'Benefit-first storytelling with platform badges and trust indicators.',
        accent: 'from-[#667eea]/30 to-[#29408a]/35',
      },
    ],
    sectionBlocks: [
      {
        _id: new ObjectId().toString(),
        heading: 'Messaging Blueprint',
        points: [
          'Audience pain points and intent mapping',
          'Clear value proposition above the fold',
          'Headline-CTA alignment for better conversion',
        ],
      },
      {
        _id: new ObjectId().toString(),
        heading: 'Design Structure',
        points: [
          'Visual hierarchy with contrast-driven blocks',
          'Mobile-first responsive components',
          'Brand-consistent typography and color rhythm',
        ],
      },
      {
        _id: new ObjectId().toString(),
        heading: 'Trust & Proof',
        points: [
          'Testimonial and review placement strategy',
          'Client logos, badges, and credibility cards',
          'FAQ layer to reduce objection friction',
        ],
      },
      {
        _id: new ObjectId().toString(),
        heading: 'Growth Optimization',
        points: [
          'A/B ready sections and copy variants',
          'Heatmap + analytics event integration',
          'Post-launch CRO iteration workflow',
        ],
      },
    ],
    processFlow: [
      {
        _id: new ObjectId().toString(),
        step: 'Step 01',
        title: 'Brief & Goal Setup',
        text: 'Define offer, audience, and conversion target KPI.',
      },
      {
        _id: new ObjectId().toString(),
        step: 'Step 02',
        title: 'Wireframe & Copy',
        text: 'Craft page flow, section intent, and CTA placements.',
      },
      {
        _id: new ObjectId().toString(),
        step: 'Step 03',
        title: 'UI & Development',
        text: 'Design + build with responsive and fast-load standards.',
      },
      {
        _id: new ObjectId().toString(),
        step: 'Step 04',
        title: 'Launch & Experiment',
        text: 'Deploy with analytics and start optimization cycles.',
      },
    ],
    conversionStats: [
      { _id: new ObjectId().toString(), value: '+38%', label: 'Average lead uplift' },
      { _id: new ObjectId().toString(), value: '-42%', label: 'Bounce rate reduction' },
      { _id: new ObjectId().toString(), value: '2.4x', label: 'CTA click improvement' },
    ],
    pricingCards: [
      {
        _id: new ObjectId().toString(),
        name: 'Starter Landing',
        features: ['1 page design', 'Responsive build', 'Lead form integration', 'Basic analytics'],
        timeline: '3-5 days',
        price: 'From $120',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Growth Landing',
        features: ['A/B-ready sections', 'Custom illustrations', 'Advanced copy blocks', 'CRM sync'],
        timeline: '7-10 days',
        price: 'From $280',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Campaign Pro',
        features: ['Multi-variant setup', 'Heatmap tooling', 'Conversion dashboard', 'CRO support'],
        timeline: '2-3 weeks',
        price: 'Custom quote',
      },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        q: 'Can you redesign an existing landing page to improve results?',
        a: 'Yes. We audit your current page, identify conversion leaks, then redesign structure, copy, and CTA hierarchy.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Will the page load fast on mobile networks?',
        a: 'Absolutely. We optimize media and frontend delivery to maintain strong page speed across devices.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Can this connect with Facebook/Google Ads tracking?',
        a: 'Yes. We can configure Meta Pixel, Google tag events, and custom conversion tracking setup.',
      },
    ],
  }
}

function getDefaultEcommerceNewsPortalPage() {
  return {
    key: 'ecommerce-news-portal-page',
    heroImage:
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=2200&q=80',
    badge: 'Commerce + Content Ecosystem',
    title: 'E-commerce & News Portal',
    subtitle:
      'Launch a high-speed online store and modern news portal under one scalable platform with strong catalog search, editorial workflows, and built-in monetization tools.',
    quickLinks: [
      { _id: new ObjectId().toString(), label: 'E-commerce & news portal', to: '/ecommerce-news-portal' },
      { _id: new ObjectId().toString(), label: 'Website Design & Development', to: '/website-development' },
      { _id: new ObjectId().toString(), label: 'Landing Page Design', to: '/landing-page-design' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
    ],
    commerceModules: [
      {
        _id: new ObjectId().toString(),
        title: 'Catalog & Inventory Core',
        detail:
          'Unlimited categories, smart product variants, warehouse stock sync, barcode-ready item setup, and low-stock alerts for faster operations.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Checkout & Payment Layer',
        detail:
          'Guest checkout, coupon system, cart recovery prompts, regional shipping rules, and payment gateway support for card, wallet, and COD.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Order & Customer Desk',
        detail:
          'Real-time order pipeline, invoice automation, return/refund controls, customer notes, and timeline tracking for support teams.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Marketing Engine',
        detail:
          'Flash sales, bundle pricing, personalized recommendations, loyalty points, abandoned-cart automation, and campaign landing blocks.',
      },
    ],
    newsroomFlow: [
      {
        _id: new ObjectId().toString(),
        phase: '01',
        heading: 'Editorial Planning',
        text: 'Beat-wise planning board, assignment approvals, and deadline calendar for editors and reporters.',
      },
      {
        _id: new ObjectId().toString(),
        phase: '02',
        heading: 'Publishing Pipeline',
        text: 'Draft-review-publish workflow with role permissions, SEO checklist, and scheduled release controls.',
      },
      {
        _id: new ObjectId().toString(),
        phase: '03',
        heading: 'Distribution & Alerts',
        text: 'Auto sharing to social channels, breaking news push notifications, and newsletter-ready snippets.',
      },
      {
        _id: new ObjectId().toString(),
        phase: '04',
        heading: 'Performance Intelligence',
        text: 'Story heatmaps, engagement score, session depth analytics, and ad placement insights.',
      },
    ],
    monetizationCards: [
      {
        _id: new ObjectId().toString(),
        name: 'Ad Revenue Suite',
        points: ['Banner slot manager', 'Sponsored story labels', 'Ad position A/B tests'],
      },
      {
        _id: new ObjectId().toString(),
        name: 'Membership & Paywall',
        points: ['Freemium article rules', 'Subscriber-only reports', 'Recurring plan billing'],
      },
      {
        _id: new ObjectId().toString(),
        name: 'Commerce-to-Content Cross Sell',
        points: ['Article to product widgets', 'Shop the story blocks', 'Trending product embeds'],
      },
    ],
    architectureHighlights: [
      { _id: new ObjectId().toString(), value: '99.95%', label: 'Target uptime readiness' },
      { _id: new ObjectId().toString(), value: '<2.2s', label: 'Mobile first-content load target' },
      { _id: new ObjectId().toString(), value: '3x', label: 'Higher repeat visits with personalization' },
      { _id: new ObjectId().toString(), value: '24/7', label: 'Operational monitoring support' },
    ],
    audienceSolutions: [
      {
        _id: new ObjectId().toString(),
        audience: 'Retail Brands',
        outcome: 'Faster product launches, cleaner checkout funnels, and repeat-purchase growth through loyalty automation.',
      },
      {
        _id: new ObjectId().toString(),
        audience: 'Media Houses',
        outcome: 'Structured newsroom workflow, high-frequency publishing, and stronger ad inventory performance.',
      },
      {
        _id: new ObjectId().toString(),
        audience: 'Hybrid Business Models',
        outcome: 'Content-driven product discovery where articles, reviews, and stories directly influence conversion.',
      },
    ],
    integrationSuite: [
      { _id: new ObjectId().toString(), text: 'Payment gateway and wallet integrations' },
      { _id: new ObjectId().toString(), text: 'Courier and shipment status sync' },
      { _id: new ObjectId().toString(), text: 'CRM and customer support tools' },
      { _id: new ObjectId().toString(), text: 'Meta pixel and GA4 event tracking' },
      { _id: new ObjectId().toString(), text: 'Email and push notification automation' },
      { _id: new ObjectId().toString(), text: 'CDN, cache, and security layer setup' },
    ],
    packageGrid: [
      {
        _id: new ObjectId().toString(),
        tier: 'Launch',
        timeline: '2-3 weeks',
        includes: ['Storefront + blog/news core', 'Basic CMS and media library', 'Analytics starter setup'],
        price: 'From $350',
      },
      {
        _id: new ObjectId().toString(),
        tier: 'Growth',
        timeline: '4-6 weeks',
        includes: ['Advanced editorial workflow', 'Marketplace-ready commerce modules', 'SEO and ad-ops toolkit'],
        price: 'From $900',
      },
      {
        _id: new ObjectId().toString(),
        tier: 'Scale Enterprise',
        timeline: 'Custom roadmap',
        includes: ['Multi-brand architecture', 'High traffic optimization', 'Data integrations + automation'],
        price: 'Custom quote',
      },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        q: 'Can I run the store and news portal with one admin panel?',
        a: 'Yes. You can manage products, orders, newsroom content, ads, users, and analytics from one unified dashboard.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Do you support Bengali and English content publishing?',
        a: 'Yes. The portal supports multilingual articles, category structures, and localized SEO metadata.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Will this support heavy traffic during campaigns or breaking news?',
        a: 'Yes. We design the stack for caching, CDN delivery, and scalable infrastructure to handle traffic spikes.',
      },
    ],
  }
}

function getDefaultDomainHostingServerPage() {
  return {
    key: 'domain-hosting-server-page',
    heroImage:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2200&q=80',
    badge: 'Domain + Hosting + Server Excellence',
    title: 'Domain, Hosting, Server Management & Support Packages',
    subtitle:
      'Build a reliable digital foundation with domain strategy, high-performance hosting, proactive server operations, and dedicated support packages designed for growing businesses.',
    quickLinks: [
      { _id: new ObjectId().toString(), label: 'Domain, hosting, server management & support packages', to: '/domain-hosting-server-management' },
      { _id: new ObjectId().toString(), label: 'Website Design & Development', to: '/website-development' },
      { _id: new ObjectId().toString(), label: 'E-commerce & news portal', to: '/ecommerce-news-portal' },
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
    ],
    domainServices: [
      {
        _id: new ObjectId().toString(),
        title: 'Domain Planning & Brand Protection',
        detail:
          'Primary domain selection, TLD strategy (.com/.net/.org/.bd), typo-domain protection, competitor conflict checks, and renewal risk prevention.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'DNS Architecture & Delivery',
        detail:
          'Managed DNS zones, failover records, SPF/DKIM/DMARC setup, subdomain routing, and CDN-aware DNS tuning for speed and reliability.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Transfer, Renewal & Ownership Governance',
        detail:
          'Safe registrar transfer, lock/unlock control, WHOIS privacy, organization ownership cleanup, and domain lifecycle governance.',
      },
    ],
    hostingStacks: [
      {
        _id: new ObjectId().toString(),
        type: 'Managed Shared / Business Hosting',
        useCase: 'Startup websites, portfolios, and business landing pages with cost-efficient management.',
        features: ['SSL included', 'Daily backup', 'Email accounts', 'Control panel access'],
      },
      {
        _id: new ObjectId().toString(),
        type: 'VPS / Cloud Hosting',
        useCase: 'High-traffic websites and custom applications needing better resource isolation.',
        features: ['Dedicated resources', 'Root access', 'Scalable RAM/CPU', 'Firewall hardening'],
      },
      {
        _id: new ObjectId().toString(),
        type: 'Dedicated & Hybrid Infrastructure',
        useCase: 'Mission-critical platforms that require maximum control, custom networking, and compliance.',
        features: ['Private networking', 'Load balancing', 'Disaster planning', 'Advanced monitoring'],
      },
    ],
    serverOpsFlow: [
      {
        _id: new ObjectId().toString(),
        step: '01',
        heading: 'Assessment & Architecture',
        text: 'Audit traffic, compute profile, risk points, and target availability before final stack design.',
      },
      {
        _id: new ObjectId().toString(),
        step: '02',
        heading: 'Provisioning & Hardening',
        text: 'Secure OS baseline, patching, access policy setup, SSH hardening, and firewall rule enforcement.',
      },
      {
        _id: new ObjectId().toString(),
        step: '03',
        heading: 'Performance Optimization',
        text: 'Web server tuning, database optimization, cache policy setup, and page delivery acceleration.',
      },
      {
        _id: new ObjectId().toString(),
        step: '04',
        heading: 'Monitoring & Incident Response',
        text: '24/7 uptime checks, threshold alerts, incident playbooks, and recovery workflows.',
      },
    ],
    supportPackages: [
      {
        _id: new ObjectId().toString(),
        name: 'Essential Care',
        timeline: 'Monthly plan',
        features: ['Uptime monitoring', 'Security patch updates', 'Weekly backup verification', 'Email support'],
        price: 'From $49/mo',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Growth Ops',
        timeline: 'Monthly plan',
        features: ['Everything in Essential', 'Performance optimization', 'Priority issue handling', 'DNS and SSL management'],
        price: 'From $119/mo',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Enterprise Guard',
        timeline: 'Custom SLA',
        features: ['24/7 incident response', 'Dedicated engineer support', 'Advanced compliance reports', 'DR drill support'],
        price: 'Custom quote',
      },
    ],
    securityCoverage: [
      {
        _id: new ObjectId().toString(),
        title: 'Server & Access Security',
        points: ['MFA-first admin access policy', 'SSH key rotation and restricted sudo model', 'WAF and firewall hardening baseline'],
      },
      {
        _id: new ObjectId().toString(),
        title: 'Data Protection & Continuity',
        points: ['Automated backup retention rules', 'Recovery point objective planning', 'Disaster recovery drill and verification'],
      },
      {
        _id: new ObjectId().toString(),
        title: 'Compliance Readiness',
        points: ['Log retention and audit trail setup', 'Security posture reporting', 'Policy alignment for industry controls'],
      },
    ],
    migrationChecklist: [
      { _id: new ObjectId().toString(), text: 'Existing DNS and registrar audit' },
      { _id: new ObjectId().toString(), text: 'Mail delivery records (SPF/DKIM/DMARC) validation' },
      { _id: new ObjectId().toString(), text: 'Staging clone and load test before cutover' },
      { _id: new ObjectId().toString(), text: 'Downtime-safe switch plan with rollback' },
      { _id: new ObjectId().toString(), text: 'Post-migration security and speed re-check' },
    ],
    platformCoverage: [
      {
        _id: new ObjectId().toString(),
        name: 'WordPress / CMS',
        detail: 'Plugin-safe updates, cache strategy, media optimization, and security hardening.',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Node / React Apps',
        detail: 'PM2/runtime process management, Nginx reverse proxy, and CI-friendly deployment flow.',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Laravel / PHP Apps',
        detail: 'Queue/cron supervision, OPcache tuning, and database connection stability setup.',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Custom APIs',
        detail: 'Rate limiting, observability dashboards, and endpoint-level uptime tracking.',
      },
    ],
    reliabilityMetrics: [
      { _id: new ObjectId().toString(), value: '99.95%', label: 'Target uptime standard' },
      { _id: new ObjectId().toString(), value: '<15 min', label: 'Critical alert response goal' },
      { _id: new ObjectId().toString(), value: '24/7', label: 'Monitoring coverage' },
      { _id: new ObjectId().toString(), value: '0-downtime', label: 'Planned release strategy' },
    ],
    faqs: [
      {
        _id: new ObjectId().toString(),
        q: 'Can you migrate my existing site and emails without downtime?',
        a: 'Yes. We prepare staging migration, DNS cutover planning, and rollback strategy to minimize or avoid downtime.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Do you provide SSL, backups, and malware protection in support plans?',
        a: 'Yes. Security, backup policy, patch updates, and threat monitoring are included based on your chosen plan.',
      },
      {
        _id: new ObjectId().toString(),
        q: 'Which option is better for me: business hosting, VPS, or dedicated server?',
        a: 'We recommend based on traffic, app complexity, security requirements, and expected growth roadmap.',
      },
    ],
  }
}

function getDefaultContentManagementPage() {
  return {
    key: 'content-management-page',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    mainImage:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1500&q=80',
    heroTitle: 'Content Management',
    sectionTitle: 'Content Management',
    sectionDescription:
      'Content management gives your team a single place to plan, publish, and optimize digital experiences. We focus on structured workflows, reusable assets, and scalable governance.',
    sectionSecondaryDescription:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
    benefitsSectionTitle: 'Our work benefits',
    benefitsSectionDescription:
      'There are many variations of passages available, but the majority have suffered alteration in some form, by injected humour, or randomised words which do not look even slightly believable.',
    mainServicesTitle: 'Main Services',
    brochuresTitle: 'Brochures',
    brochuresDescription:
      'Cras enim urna, interdum nec porttitor vitae, sollicitudin eu eros. Praesent eget mollis nulla.',
    brochuresPrimaryButton: 'Download',
    brochuresOrLabel: 'OR',
    brochuresSecondaryButton: 'Discover',
    followUsTitle: 'Follow Us',
    serviceLinks: [
      { _id: new ObjectId().toString(), label: 'Information Security', to: '/information-security' },
      { _id: new ObjectId().toString(), label: 'Mobile Platforms', to: '/mobile-platform' },
      { _id: new ObjectId().toString(), label: 'Data Synchronization', to: '/data-synchronization' },
      { _id: new ObjectId().toString(), label: 'Process Automation', to: '/process-automation' },
      { _id: new ObjectId().toString(), label: 'Event Processing', to: '/event-processing' },
      { _id: new ObjectId().toString(), label: 'Content Management', to: '/content-management' },
    ],
    socials: [
      { _id: new ObjectId().toString(), label: 'f' },
      { _id: new ObjectId().toString(), label: 't' },
      { _id: new ObjectId().toString(), label: 'i' },
      { _id: new ObjectId().toString(), label: 'in' },
    ],
    gallery: [
      {
        _id: new ObjectId().toString(),
        url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80',
      },
      {
        _id: new ObjectId().toString(),
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
      },
      {
        _id: new ObjectId().toString(),
        url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80',
      },
    ],
    checklist: [
      { _id: new ObjectId().toString(), text: 'Marketing options and rates' },
      { _id: new ObjectId().toString(), text: 'Research beyond the business plan' },
      { _id: new ObjectId().toString(), text: 'The ability to turnaround consulting' },
      { _id: new ObjectId().toString(), text: 'Customer engagement matters' },
    ],
  }
}

function getDefaultPrivacyPolicyPage() {
  return {
    key: 'privacy-policy-page',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    pageTitle: 'Privacy Policy',
    sections: [
      {
        _id: new ObjectId().toString(),
        title: 'Introduction',
        paragraphs: [
          'SoftEdge Technology Limited is committed to protecting the privacy of our clients, partners, and website visitors. This Privacy Policy explains how we collect, use, store, and protect your personal information when you interact with our website or services.',
          'By using our platform, you agree to the practices described in this policy. We encourage you to read this page carefully so you understand what information we process and why we process it.',
        ],
      },
      {
        _id: new ObjectId().toString(),
        title: 'Use of user information.',
        paragraphs: [
          'We use the information we collect to respond to inquiries, deliver requested services, improve user experience, maintain platform security, and communicate important service-related updates.',
        ],
        bullets: [
          'Provide support and respond to business inquiries',
          'Improve website performance and user experience',
          'Maintain service quality, security, and compliance',
        ],
        footer:
          'We only use personal information for legitimate business purposes and process it in a way that is relevant, limited, and appropriate for the services we provide.',
      },
      {
        _id: new ObjectId().toString(),
        title: 'Disclosure of user information.',
        paragraphs: [
          'We do not sell or rent your personal information. Information may be shared only when necessary with trusted service providers, legal authorities, or internal teams that help us operate our business, and always under appropriate confidentiality and security obligations.',
        ],
      },
    ],
    asidePrivacyFirst: {
      label: 'Privacy First',
      title: 'Your data deserves clarity and protection.',
      description:
        'We keep our privacy practices transparent, secure, and aligned with the trust our clients place in us.',
    },
    asideHighlights: {
      label: 'Highlights',
      items: [
        { _id: new ObjectId().toString(), text: 'Clear handling of personal and business information' },
        { _id: new ObjectId().toString(), text: 'Restricted sharing with trusted parties only' },
        { _id: new ObjectId().toString(), text: 'Security-focused storage and operational safeguards' },
      ],
    },
    asideNeedHelp: {
      label: 'Need help?',
      description:
        'For privacy-related questions, you can connect with our team and request more information about data handling, updates, or policy clarification.',
    },
  }
}

function validateEventProcessingArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === eventProcessingSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === eventProcessingSections.socials) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === eventProcessingSections.checklist) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === eventProcessingSections.benefits) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    const icon = typeof payload.icon === 'string' ? payload.icon.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
    if (!partial || 'icon' in payload) {
      if (!icon) errors.push('icon is required')
      else value.icon = icon
    }
  }

  return { errors, value }
}

function validateContentManagementArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === contentManagementSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === contentManagementSections.socials) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === contentManagementSections.gallery) {
    const url = typeof payload.url === 'string' ? payload.url.trim() : ''
    if (!partial || 'url' in payload) {
      if (!url) errors.push('url is required')
      else value.url = url
    }
  }

  if (section === contentManagementSections.checklist) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  return { errors, value }
}

function validateMunicipalityUnionManagementArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === municipalityUnionManagementSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === municipalityUnionManagementSections.civicModules) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    const icon = typeof payload.icon === 'string' ? payload.icon.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
    if (!partial || 'icon' in payload) {
      if (!icon) errors.push('icon is required')
      else value.icon = icon
    }
  }

  if (section === municipalityUnionManagementSections.processTimeline) {
    const step = typeof payload.step === 'string' ? payload.step.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'step' in payload) {
      if (!step) errors.push('step is required')
      else value.step = step
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === municipalityUnionManagementSections.performanceCards) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const cardValue = typeof payload.value === 'string' ? payload.value.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'value' in payload) {
      if (!cardValue) errors.push('value is required')
      else value.value = cardValue
    }
  }

  if (section === municipalityUnionManagementSections.governanceFeatures) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === municipalityUnionManagementSections.faq) {
    const q = typeof payload.q === 'string' ? payload.q.trim() : ''
    const a = typeof payload.a === 'string' ? payload.a.trim() : ''
    if (!partial || 'q' in payload) {
      if (!q) errors.push('q is required')
      else value.q = q
    }
    if (!partial || 'a' in payload) {
      if (!a) errors.push('a is required')
      else value.a = a
    }
  }

  return { errors, value }
}

function validatePaymentGatewaysArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === paymentGatewaysSections.heroStats || section === paymentGatewaysSections.metrics) {
    const valueText = typeof payload.value === 'string' ? payload.value.trim() : ''
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'value' in payload) {
      if (!valueText) errors.push('value is required')
      else value.value = valueText
    }
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === paymentGatewaysSections.serviceLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === paymentGatewaysSections.rails) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    const gradient = typeof payload.gradient === 'string' ? payload.gradient.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
    if (!partial || 'gradient' in payload) {
      if (!gradient) errors.push('gradient is required')
      else value.gradient = gradient
    }
  }

  if (section === paymentGatewaysSections.partnerChannels) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if (!partial || 'detail' in payload) {
      if (!detail) errors.push('detail is required')
      else value.detail = detail
    }
  }

  if (section === paymentGatewaysSections.flowSteps) {
    const phase = typeof payload.phase === 'string' ? payload.phase.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'phase' in payload) {
      if (!phase) errors.push('phase is required')
      else value.phase = phase
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === paymentGatewaysSections.riskLayers) {
    const layerId = typeof payload.id === 'string' ? payload.id.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'id' in payload) {
      if (!layerId) errors.push('id is required')
      else value.id = layerId
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === paymentGatewaysSections.walletCapabilities) {
    const code = typeof payload.code === 'string' ? payload.code.trim() : ''
    const heading = typeof payload.heading === 'string' ? payload.heading.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
    if (!partial || 'code' in payload) {
      if (!code) errors.push('code is required')
      else value.code = code
    }
    if (!partial || 'heading' in payload) {
      if (!heading) errors.push('heading is required')
      else value.heading = heading
    }
    if (!partial || 'detail' in payload) {
      if (!detail) errors.push('detail is required')
      else value.detail = detail
    }
  }

  if (section === paymentGatewaysSections.businessUseCases) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === paymentGatewaysSections.faqs) {
    const q = typeof payload.q === 'string' ? payload.q.trim() : ''
    const a = typeof payload.a === 'string' ? payload.a.trim() : ''
    if (!partial || 'q' in payload) {
      if (!q) errors.push('q is required')
      else value.q = q
    }
    if (!partial || 'a' in payload) {
      if (!a) errors.push('a is required')
      else value.a = a
    }
  }

  return { errors, value }
}

function validateWebsiteDevelopmentArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === websiteDevelopmentSections.introPoints || section === websiteDevelopmentSections.stack) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === websiteDevelopmentSections.quickLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (
    section === websiteDevelopmentSections.designPillars ||
    section === websiteDevelopmentSections.partnerChannels ||
    section === websiteDevelopmentSections.serviceDetails ||
    section === websiteDevelopmentSections.businessUseCases
  ) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''

    if (section === websiteDevelopmentSections.designPillars) {
      if (!partial || 'name' in payload) {
        if (!name) errors.push('name is required')
        else value.name = name
      }
      if (!partial || 'detail' in payload) {
        if (!detail) errors.push('detail is required')
        else value.detail = detail
      }
    } else {
      if (!partial || 'title' in payload) {
        if (!title) errors.push('title is required')
        else value.title = title
      }
      if (!partial || 'text' in payload) {
        if (!text) errors.push('text is required')
        else value.text = text
      }
    }
  }

  if (section === websiteDevelopmentSections.deliveryTracks) {
    const track = typeof payload.track === 'string' ? payload.track.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'track' in payload) {
      if (!track) errors.push('track is required')
      else value.track = track
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === websiteDevelopmentSections.packageGrid) {
    const type = typeof payload.type === 'string' ? payload.type.trim() : ''
    const scope = typeof payload.scope === 'string' ? payload.scope.trim() : ''
    const eta = typeof payload.eta === 'string' ? payload.eta.trim() : ''
    const price = typeof payload.price === 'string' ? payload.price.trim() : ''
    if (!partial || 'type' in payload) {
      if (!type) errors.push('type is required')
      else value.type = type
    }
    if (!partial || 'scope' in payload) {
      if (!scope) errors.push('scope is required')
      else value.scope = scope
    }
    if (!partial || 'eta' in payload) {
      if (!eta) errors.push('eta is required')
      else value.eta = eta
    }
    if (!partial || 'price' in payload) {
      if (!price) errors.push('price is required')
      else value.price = price
    }
  }

  if (section === websiteDevelopmentSections.projectShowcase) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const category = typeof payload.category === 'string' ? payload.category.trim() : ''
    const summary = typeof payload.summary === 'string' ? payload.summary.trim() : ''
    const liveLink = typeof payload.liveLink === 'string' ? payload.liveLink.trim() : ''
    const githubLink = typeof payload.githubLink === 'string' ? payload.githubLink.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    const tech = Array.isArray(payload.tech) ? payload.tech.filter((t) => typeof t === 'string').map((t) => t.trim()).filter(Boolean) : []

    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if (!partial || 'category' in payload) {
      if (!category) errors.push('category is required')
      else value.category = category
    }
    if (!partial || 'summary' in payload) {
      if (!summary) errors.push('summary is required')
      else value.summary = summary
    }
    if (!partial || 'liveLink' in payload) {
      if (!liveLink) errors.push('liveLink is required')
      else value.liveLink = liveLink
    }
    if (!partial || 'githubLink' in payload) {
      if (!githubLink) errors.push('githubLink is required')
      else value.githubLink = githubLink
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
    if ('tech' in payload || !partial) {
      if (!tech.length) errors.push('tech is required')
      else value.tech = tech
    }
  }

  if (section === websiteDevelopmentSections.stats) {
    const valueText = typeof payload.value === 'string' ? payload.value.trim() : ''
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'value' in payload) {
      if (!valueText) errors.push('value is required')
      else value.value = valueText
    }
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === websiteDevelopmentSections.faqs) {
    const q = typeof payload.q === 'string' ? payload.q.trim() : ''
    const a = typeof payload.a === 'string' ? payload.a.trim() : ''
    if (!partial || 'q' in payload) {
      if (!q) errors.push('q is required')
      else value.q = q
    }
    if (!partial || 'a' in payload) {
      if (!a) errors.push('a is required')
      else value.a = a
    }
  }

  return { errors, value }
}

function validateLandingPageDesignArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === landingPageDesignSections.quickActions) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === landingPageDesignSections.campaignTypes) {
    const type = typeof payload.type === 'string' ? payload.type.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
    const accent = typeof payload.accent === 'string' ? payload.accent.trim() : ''
    if (!partial || 'type' in payload) {
      if (!type) errors.push('type is required')
      else value.type = type
    }
    if (!partial || 'detail' in payload) {
      if (!detail) errors.push('detail is required')
      else value.detail = detail
    }
    if (!partial || 'accent' in payload) {
      if (!accent) errors.push('accent is required')
      else value.accent = accent
    }
  }

  if (section === landingPageDesignSections.sectionBlocks) {
    const heading = typeof payload.heading === 'string' ? payload.heading.trim() : ''
    const points = Array.isArray(payload.points)
      ? payload.points.filter((p) => typeof p === 'string').map((p) => p.trim()).filter(Boolean)
      : []
    if (!partial || 'heading' in payload) {
      if (!heading) errors.push('heading is required')
      else value.heading = heading
    }
    if ('points' in payload || !partial) {
      if (!points.length) errors.push('points is required')
      else value.points = points
    }
  }

  if (section === landingPageDesignSections.processFlow) {
    const step = typeof payload.step === 'string' ? payload.step.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'step' in payload) {
      if (!step) errors.push('step is required')
      else value.step = step
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === landingPageDesignSections.conversionStats) {
    const valueText = typeof payload.value === 'string' ? payload.value.trim() : ''
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'value' in payload) {
      if (!valueText) errors.push('value is required')
      else value.value = valueText
    }
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === landingPageDesignSections.pricingCards) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const timeline = typeof payload.timeline === 'string' ? payload.timeline.trim() : ''
    const price = typeof payload.price === 'string' ? payload.price.trim() : ''
    const features = Array.isArray(payload.features)
      ? payload.features.filter((f) => typeof f === 'string').map((f) => f.trim()).filter(Boolean)
      : []
    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if ('features' in payload || !partial) {
      if (!features.length) errors.push('features is required')
      else value.features = features
    }
    if (!partial || 'timeline' in payload) {
      if (!timeline) errors.push('timeline is required')
      else value.timeline = timeline
    }
    if (!partial || 'price' in payload) {
      if (!price) errors.push('price is required')
      else value.price = price
    }
  }

  if (section === landingPageDesignSections.faqs) {
    const q = typeof payload.q === 'string' ? payload.q.trim() : ''
    const a = typeof payload.a === 'string' ? payload.a.trim() : ''
    if (!partial || 'q' in payload) {
      if (!q) errors.push('q is required')
      else value.q = q
    }
    if (!partial || 'a' in payload) {
      if (!a) errors.push('a is required')
      else value.a = a
    }
  }

  return { errors, value }
}

function validateEcommerceNewsPortalArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === ecommerceNewsPortalSections.quickLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === ecommerceNewsPortalSections.commerceModules) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'detail' in payload) {
      if (!detail) errors.push('detail is required')
      else value.detail = detail
    }
  }

  if (section === ecommerceNewsPortalSections.newsroomFlow) {
    const phase = typeof payload.phase === 'string' ? payload.phase.trim() : ''
    const heading = typeof payload.heading === 'string' ? payload.heading.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'phase' in payload) {
      if (!phase) errors.push('phase is required')
      else value.phase = phase
    }
    if (!partial || 'heading' in payload) {
      if (!heading) errors.push('heading is required')
      else value.heading = heading
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === ecommerceNewsPortalSections.monetizationCards) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const points = Array.isArray(payload.points)
      ? payload.points.filter((p) => typeof p === 'string').map((p) => p.trim()).filter(Boolean)
      : []
    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if ('points' in payload || !partial) {
      if (!points.length) errors.push('points is required')
      else value.points = points
    }
  }

  if (section === ecommerceNewsPortalSections.architectureHighlights) {
    const valueText = typeof payload.value === 'string' ? payload.value.trim() : ''
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'value' in payload) {
      if (!valueText) errors.push('value is required')
      else value.value = valueText
    }
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === ecommerceNewsPortalSections.audienceSolutions) {
    const audience = typeof payload.audience === 'string' ? payload.audience.trim() : ''
    const outcome = typeof payload.outcome === 'string' ? payload.outcome.trim() : ''
    if (!partial || 'audience' in payload) {
      if (!audience) errors.push('audience is required')
      else value.audience = audience
    }
    if (!partial || 'outcome' in payload) {
      if (!outcome) errors.push('outcome is required')
      else value.outcome = outcome
    }
  }

  if (section === ecommerceNewsPortalSections.integrationSuite) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === ecommerceNewsPortalSections.packageGrid) {
    const tier = typeof payload.tier === 'string' ? payload.tier.trim() : ''
    const timeline = typeof payload.timeline === 'string' ? payload.timeline.trim() : ''
    const price = typeof payload.price === 'string' ? payload.price.trim() : ''
    const includes = Array.isArray(payload.includes)
      ? payload.includes.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
      : []
    if (!partial || 'tier' in payload) {
      if (!tier) errors.push('tier is required')
      else value.tier = tier
    }
    if (!partial || 'timeline' in payload) {
      if (!timeline) errors.push('timeline is required')
      else value.timeline = timeline
    }
    if (!partial || 'price' in payload) {
      if (!price) errors.push('price is required')
      else value.price = price
    }
    if ('includes' in payload || !partial) {
      if (!includes.length) errors.push('includes is required')
      else value.includes = includes
    }
  }

  if (section === ecommerceNewsPortalSections.faqs) {
    const q = typeof payload.q === 'string' ? payload.q.trim() : ''
    const a = typeof payload.a === 'string' ? payload.a.trim() : ''
    if (!partial || 'q' in payload) {
      if (!q) errors.push('q is required')
      else value.q = q
    }
    if (!partial || 'a' in payload) {
      if (!a) errors.push('a is required')
      else value.a = a
    }
  }

  return { errors, value }
}

function validateDomainHostingServerArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === domainHostingServerSections.quickLinks) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
    if (!partial || 'to' in payload) {
      if (!to) errors.push('to is required')
      else value.to = to
    }
  }

  if (section === domainHostingServerSections.domainServices) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'detail' in payload) {
      if (!detail) errors.push('detail is required')
      else value.detail = detail
    }
  }

  if (section === domainHostingServerSections.hostingStacks) {
    const type = typeof payload.type === 'string' ? payload.type.trim() : ''
    const useCase = typeof payload.useCase === 'string' ? payload.useCase.trim() : ''
    const features = Array.isArray(payload.features)
      ? payload.features.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
      : []
    if (!partial || 'type' in payload) {
      if (!type) errors.push('type is required')
      else value.type = type
    }
    if (!partial || 'useCase' in payload) {
      if (!useCase) errors.push('useCase is required')
      else value.useCase = useCase
    }
    if ('features' in payload || !partial) {
      if (!features.length) errors.push('features is required')
      else value.features = features
    }
  }

  if (section === domainHostingServerSections.serverOpsFlow) {
    const step = typeof payload.step === 'string' ? payload.step.trim() : ''
    const heading = typeof payload.heading === 'string' ? payload.heading.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'step' in payload) {
      if (!step) errors.push('step is required')
      else value.step = step
    }
    if (!partial || 'heading' in payload) {
      if (!heading) errors.push('heading is required')
      else value.heading = heading
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === domainHostingServerSections.supportPackages) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const timeline = typeof payload.timeline === 'string' ? payload.timeline.trim() : ''
    const price = typeof payload.price === 'string' ? payload.price.trim() : ''
    const features = Array.isArray(payload.features)
      ? payload.features.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
      : []
    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if (!partial || 'timeline' in payload) {
      if (!timeline) errors.push('timeline is required')
      else value.timeline = timeline
    }
    if (!partial || 'price' in payload) {
      if (!price) errors.push('price is required')
      else value.price = price
    }
    if ('features' in payload || !partial) {
      if (!features.length) errors.push('features is required')
      else value.features = features
    }
  }

  if (section === domainHostingServerSections.securityCoverage) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const points = Array.isArray(payload.points)
      ? payload.points.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
      : []
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if ('points' in payload || !partial) {
      if (!points.length) errors.push('points is required')
      else value.points = points
    }
  }

  if (section === domainHostingServerSections.migrationChecklist) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === domainHostingServerSections.platformCoverage) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if (!partial || 'detail' in payload) {
      if (!detail) errors.push('detail is required')
      else value.detail = detail
    }
  }

  if (section === domainHostingServerSections.reliabilityMetrics) {
    const valueText = typeof payload.value === 'string' ? payload.value.trim() : ''
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'value' in payload) {
      if (!valueText) errors.push('value is required')
      else value.value = valueText
    }
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === domainHostingServerSections.faqs) {
    const q = typeof payload.q === 'string' ? payload.q.trim() : ''
    const a = typeof payload.a === 'string' ? payload.a.trim() : ''
    if (!partial || 'q' in payload) {
      if (!q) errors.push('q is required')
      else value.q = q
    }
    if (!partial || 'a' in payload) {
      if (!a) errors.push('a is required')
      else value.a = a
    }
  }

  return { errors, value }
}

async function getInformationSecurityPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'information-security-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultInformationSecurityPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getMobilePlatformPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'mobile-platform-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultMobilePlatformPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getDataSynchronizationPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'data-synchronization-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultDataSynchronizationPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getProcessAutomationPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'process-automation-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultProcessAutomationPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getEducationalInstituteManagementPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'educational-institute-management-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultEducationalInstituteManagementPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getErpSoftwarePageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'erp-software-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultErpSoftwarePage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getHospitalManagementSoftwarePageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'hospital-management-software-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultHospitalManagementSoftwarePage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getPharmacyManagementSoftwarePageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'pharmacy-management-software-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultPharmacyManagementSoftwarePage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getRestaurantManagementSoftwarePageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'restaurant-management-software-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultRestaurantManagementSoftwarePage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getInventoryManagementSoftwarePageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'inventory-management-software-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultInventoryManagementSoftwarePage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getMunicipalityUnionManagementPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'municipality-union-management-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultMunicipalityUnionManagementPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getPaymentGatewaysPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'payment-gateways-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultPaymentGatewaysPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getWebsiteDevelopmentPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'website-development-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultWebsiteDevelopmentPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getLandingPageDesignPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'landing-page-design-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultLandingPageDesignPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getEcommerceNewsPortalPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'ecommerce-news-portal-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultEcommerceNewsPortalPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getDomainHostingServerPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'domain-hosting-server-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultDomainHostingServerPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getEventProcessingPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'event-processing-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultEventProcessingPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

async function getContentManagementPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'content-management-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultContentManagementPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

const aboutPageSections = {
  processSteps: 'processSteps',
  whyChooseUsServices: 'whyChooseUsServices',
  reviews: 'reviews',
  stats: 'stats',
  team: 'team',
}

function getDefaultAboutPage() {
  return {
    key: 'about-page',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    workProcessEyebrow: 'Work Process',
    workProcessTitle: 'Our Working Process',
    processSteps: [
      {
        _id: new ObjectId().toString(),
        stepId: '01',
        title: 'Design',
        description: 'We focus on best practices for IT solutions and services.',
        image:
          'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
      },
      {
        _id: new ObjectId().toString(),
        stepId: '02',
        title: 'Testing',
        description: 'We validate every detail to ensure quality delivery.',
        image:
          'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=900&q=80',
      },
      {
        _id: new ObjectId().toString(),
        stepId: '03',
        title: 'Go-Live',
        description: 'We launch with confidence and provide reliable support.',
        image:
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
      },
    ],
    whyChooseUsImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    whyChooseUsEyebrow: 'Why Choose Us',
    whyChooseUsTitle: 'We are building a sustainable future',
    whyChooseUsDescription:
      'Tremendous involvement with power departure, land master current, liaisoning and working with state. An ideal mix of worldwide experience and skill to additional our attention on innovation.',
    whyChooseUsServices: [
      { _id: new ObjectId().toString(), label: 'Web Development' },
      { _id: new ObjectId().toString(), label: 'Branding Services' },
      { _id: new ObjectId().toString(), label: 'Digital Marketing' },
    ],
    reviews: [
      {
        _id: new ObjectId().toString(),
        name: 'Gemma Krischock',
        role: 'Web Designer',
        image:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        text: 'IT solution is the most valuable business resource we have ever purchased. It really saves time and effort for our team.',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Liam Foster',
        role: 'Product Manager',
        image:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
        text: 'Their team delivered exactly what we needed. From planning to launch, every step was smooth and highly professional.',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Avery Collins',
        role: 'Operations Lead',
        image:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
        text: 'We reduced repetitive work and improved delivery speed after implementing their solution. Outstanding support and communication.',
      },
    ],
    stats: [
      { _id: new ObjectId().toString(), end: 15, suffix: 'k', label: 'Customers' },
      { _id: new ObjectId().toString(), end: 78, suffix: '+', label: 'Branches' },
      { _id: new ObjectId().toString(), end: 3, suffix: 'k', label: 'Employees' },
      { _id: new ObjectId().toString(), end: 8, suffix: '+', label: 'Countries' },
    ],
    aboutEyebrow: 'About Us',
    aboutTitle: "We're Delivering The Best Customer Experience",
    missionTitle: 'Our Mission',
    missionText:
      "Our Mission is to be the industry's top-rated provider issuer enterprise targeting satisfying the most to our clients.",
    visionTitle: 'Our Vision',
    visionText:
      'Our Vision is to be a top Web Design company in the IT sector and progress in our current position in the market.',
    aboutMainImage:
      'https://images.unsplash.com/photo-1527219525722-f9767a7f2884?auto=format&fit=crop&w=1400&q=80',
    aboutOverlayImage:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
    teamEyebrow: 'Our Team',
    teamTitle: 'Our Motivated Team',
    team: [
      {
        _id: new ObjectId().toString(),
        name: 'Hamish French',
        role: 'Computer Scientist',
        image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
        facebookUrl: '',
        linkedinUrl: '',
        githubUrl: '',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Zara Matheson',
        role: 'CEO',
        image:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
        facebookUrl: '',
        linkedinUrl: '',
        githubUrl: '',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Dylan Bonney',
        role: 'Process Analyst',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
        facebookUrl: '',
        linkedinUrl: '',
        githubUrl: '',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Skye Finney',
        role: 'Web Developer',
        image:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
        facebookUrl: '',
        linkedinUrl: '',
        githubUrl: '',
      },
    ],
  }
}

function validateAboutPageArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === aboutPageSections.processSteps) {
    const stepId = typeof payload.stepId === 'string' ? payload.stepId.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const description = typeof payload.description === 'string' ? payload.description.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    if (!partial || 'stepId' in payload) {
      if (!stepId) errors.push('stepId is required')
      else value.stepId = stepId
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'description' in payload) {
      if (!description) errors.push('description is required')
      else value.description = description
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
  }

  if (section === aboutPageSections.whyChooseUsServices) {
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === aboutPageSections.reviews) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const role = typeof payload.role === 'string' ? payload.role.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if (!partial || 'role' in payload) {
      if (!role) errors.push('role is required')
      else value.role = role
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === aboutPageSections.stats) {
    if (!partial || 'end' in payload) {
      const raw = payload.end
      const end = typeof raw === 'number' ? raw : Number(raw)
      if (!Number.isFinite(end)) errors.push('end must be a finite number')
      else value.end = Math.round(end)
    }
    const suffix = typeof payload.suffix === 'string' ? payload.suffix.trim() : ''
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'suffix' in payload) {
      if (!suffix) errors.push('suffix is required')
      else value.suffix = suffix
    }
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  if (section === aboutPageSections.team) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const role = typeof payload.role === 'string' ? payload.role.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if (!partial || 'role' in payload) {
      if (!role) errors.push('role is required')
      else value.role = role
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }

    const socialString = (key) =>
      typeof payload[key] === 'string' ? payload[key].trim() : ''

    if (!partial) {
      value.facebookUrl = socialString('facebookUrl')
      value.linkedinUrl = socialString('linkedinUrl')
      value.githubUrl = socialString('githubUrl')
    } else {
      if ('facebookUrl' in payload) value.facebookUrl = socialString('facebookUrl')
      if ('linkedinUrl' in payload) value.linkedinUrl = socialString('linkedinUrl')
      if ('githubUrl' in payload) value.githubUrl = socialString('githubUrl')
    }
  }

  return { errors, value }
}

async function getAboutPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'about-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultAboutPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

const howWeWorkPageSections = {
  history: 'history',
  plans: 'plans',
  pricingFeatures: 'pricingFeatures',
  stats: 'stats',
}

function getDefaultHowWeWorkPage() {
  return {
    key: 'how-we-work-page',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    historyEyebrow: 'Our History',
    historyTitle: 'How We Started',
    history: [
      {
        _id: new ObjectId().toString(),
        year: '2000',
        title: 'Company founded',
        description:
          "We're committed to providing customers exceptional service offering employees the best training.",
        image:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
      },
      {
        _id: new ObjectId().toString(),
        year: '2005',
        title: 'Hiring more staff',
        description:
          "We're committed to providing customers exceptional service offering employees the best training.",
        image:
          'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80',
      },
      {
        _id: new ObjectId().toString(),
        year: '2007',
        title: 'Working on projects',
        description:
          "We're committed to providing customers exceptional service offering employees the best training.",
        image:
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
      },
    ],
    pricingEyebrow: 'Pricing Table',
    pricingTitle: 'Our Pricing Plans',
    pricingFeatures: [
      { _id: new ObjectId().toString(), text: '30 Analytics Campaign' },
      { _id: new ObjectId().toString(), text: 'Branded Reports' },
      { _id: new ObjectId().toString(), text: '700 Keywords' },
      { _id: new ObjectId().toString(), text: '100 Social Account' },
      { _id: new ObjectId().toString(), text: 'Phone & Email Support' },
    ],
    plans: [
      {
        _id: new ObjectId().toString(),
        name: 'Basic',
        price: 59,
        image:
          'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=900&q=80',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Standard',
        price: 99,
        image:
          'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=900&q=80',
      },
      {
        _id: new ObjectId().toString(),
        name: 'Professional',
        price: 129,
        image:
          'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
      },
    ],
    planButtonLabel: 'Start Now',
    statsBannerImage:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=80',
    stats: [
      { _id: new ObjectId().toString(), value: '15k', label: 'Customers' },
      { _id: new ObjectId().toString(), value: '78+', label: 'Branches' },
      { _id: new ObjectId().toString(), value: '3k', label: 'Employees' },
      { _id: new ObjectId().toString(), value: '8+', label: 'Countries' },
    ],
  }
}

function validateHowWeWorkArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === howWeWorkPageSections.history) {
    const year = typeof payload.year === 'string' ? payload.year.trim() : ''
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const description = typeof payload.description === 'string' ? payload.description.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    if (!partial || 'year' in payload) {
      if (!year) errors.push('year is required')
      else value.year = year
    }
    if (!partial || 'title' in payload) {
      if (!title) errors.push('title is required')
      else value.title = title
    }
    if (!partial || 'description' in payload) {
      if (!description) errors.push('description is required')
      else value.description = description
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
  }

  if (section === howWeWorkPageSections.plans) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const image = typeof payload.image === 'string' ? payload.image.trim() : ''
    if (!partial || 'name' in payload) {
      if (!name) errors.push('name is required')
      else value.name = name
    }
    if (!partial || 'price' in payload) {
      const raw = payload.price
      const price = typeof raw === 'number' ? raw : Number(raw)
      if (!Number.isFinite(price)) errors.push('price must be a finite number')
      else value.price = Math.round(price * 100) / 100
    }
    if (!partial || 'image' in payload) {
      if (!image) errors.push('image is required')
      else value.image = image
    }
  }

  if (section === howWeWorkPageSections.pricingFeatures) {
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    if (!partial || 'text' in payload) {
      if (!text) errors.push('text is required')
      else value.text = text
    }
  }

  if (section === howWeWorkPageSections.stats) {
    const statValue = typeof payload.value === 'string' ? payload.value.trim() : ''
    const label = typeof payload.label === 'string' ? payload.label.trim() : ''
    if (!partial || 'value' in payload) {
      if (!statValue) errors.push('value is required')
      else value.value = statValue
    }
    if (!partial || 'label' in payload) {
      if (!label) errors.push('label is required')
      else value.label = label
    }
  }

  return { errors, value }
}

async function getHowWeWorkPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'how-we-work-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultHowWeWorkPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

const faqPageSections = {
  faqItems: 'faqItems',
}

function getDefaultFaqPage() {
  return {
    key: 'faq-page',
    heroImage:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80',
    sidebarEyebrow: 'Support Center',
    sidebarTitle: 'Frequently Asked Questions',
    sidebarDescription:
      'Find quick answers to common questions about our services, timelines, and support process.',
    contactCardTitle: 'Need more help?',
    contactCardBody: 'Email us at support@softedge.com or call (+44) 123 456 789.',
    faqItems: [
      {
        _id: new ObjectId().toString(),
        question: 'How long does it take to deliver a website project?',
        answer:
          'Typical business websites take 2-6 weeks depending on complexity, content readiness, and revision rounds.',
      },
      {
        _id: new ObjectId().toString(),
        question: 'Do you provide support after project delivery?',
        answer:
          'Yes. We provide post-launch maintenance, bug fixes, and optional monthly support plans.',
      },
      {
        _id: new ObjectId().toString(),
        question: 'Can I request custom features for my business workflow?',
        answer:
          'Absolutely. We build custom modules and integrations tailored to your team and business operations.',
      },
      {
        _id: new ObjectId().toString(),
        question: 'Will my website be mobile friendly and SEO optimized?',
        answer:
          'Yes, all pages are built responsive-first with clean structure and on-page SEO best practices.',
      },
      {
        _id: new ObjectId().toString(),
        question: 'Do you redesign existing websites?',
        answer:
          'Yes, we can modernize your existing site, improve performance, and align it with your current brand.',
      },
    ],
  }
}

function validateFaqPageArrayItem(section, payload = {}, { partial = false } = {}) {
  const value = {}
  const errors = []

  if (section === faqPageSections.faqItems) {
    const question = typeof payload.question === 'string' ? payload.question.trim() : ''
    const answer = typeof payload.answer === 'string' ? payload.answer.trim() : ''
    if (!partial || 'question' in payload) {
      if (!question) errors.push('question is required')
      else value.question = question
    }
    if (!partial || 'answer' in payload) {
      if (!answer) errors.push('answer is required')
      else value.answer = answer
    }
  }

  return { errors, value }
}

async function getFaqPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'faq-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultFaqPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

const ourTeamPageSections = {
  teamMembers: 'teamMembers',
}

function normalizeTeamMemberSocial(payload = {}) {
  const s = payload.social && typeof payload.social === 'object' ? payload.social : {}
  return {
    facebook: typeof s.facebook === 'string' ? s.facebook.trim() : '',
    linkedin: typeof s.linkedin === 'string' ? s.linkedin.trim() : '',
    github: typeof s.github === 'string' ? s.github.trim() : '',
  }
}

function getDefaultOurTeamPage() {
  return {
    key: 'our-team-page',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    teamMembers: [
      {
        _id: new ObjectId().toString(),
        name: 'Hamish French',
        role: 'Computer Scientist',
        image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
        social: {
          facebook: 'https://facebook.com/hamish.french',
          linkedin: 'https://linkedin.com/in/hamish-french',
          github: 'https://github.com/hamishfrench',
        },
      },
      {
        _id: new ObjectId().toString(),
        name: 'Zara Matheson',
        role: 'CEO',
        image:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
        social: {
          facebook: 'https://facebook.com/zara.matheson',
          linkedin: 'https://linkedin.com/in/zara-matheson',
          github: 'https://github.com/zaramatheson',
        },
      },
      {
        _id: new ObjectId().toString(),
        name: 'Dylan Bonney',
        role: 'Process Analyst',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
        social: {
          facebook: 'https://facebook.com/dylan.bonney',
          linkedin: 'https://linkedin.com/in/dylan-bonney',
          github: 'https://github.com/dylanbonney',
        },
      },
      {
        _id: new ObjectId().toString(),
        name: 'Skye Finney',
        role: 'Web Developer',
        image:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
        social: {
          facebook: 'https://facebook.com/skye.finney',
          linkedin: 'https://linkedin.com/in/skye-finney',
          github: 'https://github.com/skyefinney',
        },
      },
      {
        _id: new ObjectId().toString(),
        name: 'Luca Barnes',
        role: 'UI Engineer',
        image:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
        social: {
          facebook: 'https://facebook.com/luca.barnes',
          linkedin: 'https://linkedin.com/in/luca-barnes',
          github: 'https://github.com/lucabarnes',
        },
      },
      {
        _id: new ObjectId().toString(),
        name: 'Elena Moore',
        role: 'Project Lead',
        image:
          'https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?auto=format&fit=crop&w=900&q=80',
        social: {
          facebook: 'https://facebook.com/elena.moore',
          linkedin: 'https://linkedin.com/in/elena-moore',
          github: 'https://github.com/elenamoore',
        },
      },
      {
        _id: new ObjectId().toString(),
        name: 'Mia Chen',
        role: 'Quality Analyst',
        image:
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80',
        social: {
          facebook: 'https://facebook.com/mia.chen',
          linkedin: 'https://linkedin.com/in/mia-chen',
          github: 'https://github.com/miachen',
        },
      },
      {
        _id: new ObjectId().toString(),
        name: 'Noah Carter',
        role: 'Business Consultant',
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=80',
        social: {
          facebook: 'https://facebook.com/noah.carter',
          linkedin: 'https://linkedin.com/in/noah-carter',
          github: 'https://github.com/noahcarter',
        },
      },
    ],
  }
}

function validateOurTeamPageArrayItem(section, payload = {}, { partial = false, existingMember } = {}) {
  const value = {}
  const errors = []

  if (section !== ourTeamPageSections.teamMembers) {
    errors.push('Invalid section')
    return { errors, value }
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  const role = typeof payload.role === 'string' ? payload.role.trim() : ''
  const image = typeof payload.image === 'string' ? payload.image.trim() : ''

  if (!partial || 'name' in payload) {
    if (!name) errors.push('name is required')
    else value.name = name
  }
  if (!partial || 'role' in payload) {
    if (!role) errors.push('role is required')
    else value.role = role
  }
  if (!partial || 'image' in payload) {
    if (!image) errors.push('image is required')
    else value.image = image
  }

  if (!partial) {
    value.social = normalizeTeamMemberSocial(payload)
  } else if ('social' in payload) {
    if (payload.social != null && typeof payload.social !== 'object') {
      errors.push('social must be an object')
    } else {
      const merged = {
        ...(existingMember?.social || { facebook: '', linkedin: '', github: '' }),
        ...(payload.social || {}),
      }
      value.social = normalizeTeamMemberSocial({ social: merged })
    }
  }

  return { errors, value }
}

async function getOurTeamPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'our-team-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultOurTeamPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

const blogPageSections = {
  posts: 'posts',
}

const DEFAULT_BLOG_FEATURED_SEED = {
  slug: 'shipping-quality-software',
  category: 'Engineering',
  date: 'Mar 12, 2026',
  readTime: '8 min read',
  title: 'How we ship quality software without slowing teams down',
  excerpt:
    'Practical notes on reviews, automation, and communication patterns that keep delivery predictable while staying friendly to product timelines.',
  image:
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
  paragraphs: [
    'Shipping software is a balance between rigor and speed. Teams that over-index on process can stall; teams that skip basics accumulate risk. We aim for a middle path: lightweight checks that catch real issues early, and automation that removes repetitive toil.',
    'Code review is one lever. We keep reviews kind, specific, and scoped — focused on correctness, security, and maintainability rather than style debates that a linter can own. Pairing on tricky changes replaces long async threads.',
    'Continuous integration gives fast signal on regressions. We invest in stable test suites and meaningful coverage around boundaries: payments, auth, data exports. Flaky tests get fixed or removed; a red build is treated as a stop-the-line moment.',
    'Communication matters as much as tooling. Short written updates, clear owners, and predictable release notes help stakeholders trust the train. When scope shifts, we renegotiate dates instead of silently absorbing pressure.',
    'None of this is novel — but applied consistently, it keeps delivery predictable without turning the team into a bureaucracy. If you are tightening your own process, start with one bottleneck and measure before adding more rules.',
  ],
}

const DEFAULT_BLOG_POSTS_SEED = [
  {
    slug: 'design-systems-that-scale',
    category: 'Design',
    date: 'Feb 28, 2026',
    readTime: '5 min read',
    title: 'Design systems that actually scale with your product',
    excerpt: 'Tokens, documentation, and governance that help designers and developers stay in sync.',
    image:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80',
    paragraphs: [
      'A design system is not only a Figma kit — it is the contract between design and engineering. Tokens for color, spacing, and typography should map cleanly to code so that updates propagate without manual drift.',
      'Documentation wins when it answers real questions: when to use a modal versus a drawer, how dense tables should be on mobile, and how to request a new component. Short examples beat long theory.',
      'Governance can be lightweight: a weekly triage for proposals, a clear RFC template, and owners for each primitive. The goal is to avoid both chaos and committee paralysis.',
    ],
  },
  {
    slug: 'api-security-checklist',
    category: 'Security',
    date: 'Feb 14, 2026',
    readTime: '6 min read',
    title: 'A pragmatic API security checklist for growing teams',
    excerpt: 'From auth flows to logging and rate limits — the essentials before you chase perfection.',
    image:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80',
    paragraphs: [
      'Start with authentication and authorization: strong session or token handling, least-privilege scopes, and clear separation between public and internal routes. Validate every input server-side.',
      'Logging should help incident response without storing secrets. Structured logs with request IDs make it easier to trace abuse. Rate limiting and anomaly alerts reduce blast radius when credentials leak.',
      'Dependency updates and TLS configuration are boring until they are not. Automate what you can and schedule the rest. Security is a habit more than a one-time audit.',
    ],
  },
  {
    slug: 'cloud-cost-awareness',
    category: 'Cloud',
    date: 'Jan 30, 2026',
    readTime: '7 min read',
    title: 'Cloud cost awareness without killing innovation',
    excerpt: 'Budget guardrails, tagging, and review cadences that make finance and engineering allies.',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    paragraphs: [
      'Tag resources by team, environment, and product area so invoices become conversations instead of mysteries. Dashboards that engineers actually open beat spreadsheets that only finance sees.',
      'Guardrails like budget alerts and sandbox limits prevent surprises while still allowing spikes for experiments. The point is signal early, not to block every new idea.',
      'A monthly thirty-minute review of top drivers often finds quick wins: oversized instances, orphaned volumes, or caches that can be tuned. Celebrate savings the same way you celebrate launches.',
    ],
  },
  {
    slug: 'remote-collaboration',
    category: 'Culture',
    date: 'Jan 18, 2026',
    readTime: '4 min read',
    title: 'Remote collaboration rituals that still feel human',
    excerpt: 'Short syncs, written defaults, and async handoffs that reduce meeting fatigue.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    paragraphs: [
      'Default to writing decisions in a durable place so people across time zones can catch up without replaying meetings. Start threads with context: goal, constraints, and a proposal.',
      'Keep synchronous time for alignment and creative work, not status reads. A tight agenda and a note-taker respect everyone’s calendar.',
      'Small social rituals — optional coffee chats, team wins in a shared channel — help remote teams feel less transactional without forcing mandatory fun.',
    ],
  },
  {
    slug: 'data-pipelines-101',
    category: 'Data',
    date: 'Jan 4, 2026',
    readTime: '9 min read',
    title: 'Data pipelines 101: reliability before fancy architecture',
    excerpt: 'Idempotency, backfills, and observability first — then worry about the graph.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    paragraphs: [
      'Reliable pipelines handle partial failures: retries with backoff, dead-letter queues, and clear ownership when a job fails at 2 a.m. Idempotent writes mean re-runs do not double-count.',
      'Backfills are normal. Design tables and jobs so historical loads are possible without rewriting everything. Document assumptions about ordering and late-arriving data.',
      'Observability — row counts, freshness SLAs, and anomaly checks — catches drift before dashboards lie to the business. Fancy orchestration is optional until the basics are boringly stable.',
    ],
  },
]

function getDefaultBlogPage() {
  return {
    key: 'blog-page',
    heroImage:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=2000&q=80',
    pageEyebrow: 'Insights',
    pageTitle: 'Blog',
    pageIntro:
      'Ideas on engineering, design, security, and how we work — written for builders and product teams.',
    featuredPost: { ...DEFAULT_BLOG_FEATURED_SEED },
    posts: DEFAULT_BLOG_POSTS_SEED.map((post) => ({
      ...post,
      _id: new ObjectId().toString(),
    })),
  }
}

function normalizeBlogParagraphs(input) {
  if (!Array.isArray(input)) return []
  return input.map((p) => (typeof p === 'string' ? p.trim() : '')).filter((p) => p.length > 0)
}

function normalizeBlogSlug(raw) {
  if (typeof raw !== 'string') return ''
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function validateBlogPostItem(payload = {}, { partial = false } = {}) {
  const errors = []
  const value = {}

  const slugRaw = payload.slug
  if (!partial || 'slug' in payload) {
    const slug = normalizeBlogSlug(typeof slugRaw === 'string' ? slugRaw : '')
    if (!slug) errors.push('slug is required')
    else value.slug = slug
  }

  const stringFields = ['category', 'date', 'readTime', 'title', 'excerpt', 'image']
  for (const field of stringFields) {
    if (!partial || field in payload) {
      const v = typeof payload[field] === 'string' ? payload[field].trim() : ''
      if (!partial && !v) errors.push(`${field} is required`)
      if (partial && field in payload && !v) errors.push(`${field} cannot be empty`)
      if (v) value[field] = v
    }
  }

  if (!partial || 'paragraphs' in payload) {
    if (!partial) {
      if (!Array.isArray(payload.paragraphs)) {
        errors.push('paragraphs must be an array')
      } else {
        const paragraphs = normalizeBlogParagraphs(payload.paragraphs)
        if (!paragraphs.length) {
          errors.push('paragraphs must contain at least one non-empty string')
        } else {
          value.paragraphs = paragraphs
        }
      }
    } else if ('paragraphs' in payload) {
      if (!Array.isArray(payload.paragraphs)) {
        errors.push('paragraphs must be an array')
      } else {
        value.paragraphs = normalizeBlogParagraphs(payload.paragraphs)
      }
    }
  }

  return { errors, value }
}

async function getBlogPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'blog-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultBlogPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

function validatePrivacyPolicySectionPayload(payload = {}, { partial = false } = {}) {
  const errors = []
  const value = {}

  if (!partial || 'title' in payload) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    if (!partial && !title) errors.push('title is required')
    if (partial && 'title' in payload && !title) errors.push('title cannot be empty')
    if (title) value.title = title
  }

  if (!partial || 'paragraphs' in payload) {
    if (!partial) {
      if (!Array.isArray(payload.paragraphs)) {
        errors.push('paragraphs must be an array of strings')
      } else {
        const paragraphs = payload.paragraphs
          .map((p) => (typeof p === 'string' ? p.trim() : ''))
          .filter((p) => p.length > 0)
        if (!paragraphs.length) errors.push('paragraphs must contain at least one non-empty string')
        else value.paragraphs = paragraphs
      }
    } else if ('paragraphs' in payload) {
      if (!Array.isArray(payload.paragraphs)) {
        errors.push('paragraphs must be an array')
      } else {
        value.paragraphs = payload.paragraphs.map((p) => (typeof p === 'string' ? p.trim() : ''))
      }
    }
  }

  if ('bullets' in payload) {
    if (payload.bullets === null) {
      value.bullets = null
    } else if (Array.isArray(payload.bullets)) {
      value.bullets = payload.bullets
        .map((b) => (typeof b === 'string' ? b.trim() : ''))
        .filter((b) => b.length > 0)
    } else {
      errors.push('bullets must be an array or null')
    }
  }

  if ('footer' in payload) {
    if (payload.footer === null) {
      value.footer = null
    } else if (typeof payload.footer === 'string') {
      value.footer = payload.footer.trim()
    } else {
      errors.push('footer must be a string or null')
    }
  }

  return { errors, value }
}

function validatePrivacyPolicyHighlightPayload(payload = {}, { partial = false } = {}) {
  const errors = []
  const value = {}
  const text = typeof payload.text === 'string' ? payload.text.trim() : ''

  if (!partial || 'text' in payload) {
    if (!text && !partial) errors.push('text is required')
    if (partial && 'text' in payload && !text) errors.push('text cannot be empty')
    if (text) value.text = text
  }

  return { errors, value }
}

async function getPrivacyPolicyPageDocument() {
  const collection = getPageContentCollection()
  const existing = await collection.findOne({ key: 'privacy-policy-page' })

  if (existing) {
    return existing
  }

  const defaults = {
    ...getDefaultPrivacyPolicyPage(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await collection.insertOne(defaults)
  return defaults
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'softedge_server', mongo: Boolean(MONGODB_URI) })
})

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file (field name: file)' })
  }
  res.json({
    message: 'File uploaded',
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    },
  })
})

app.post('/api/users/sync', async (req, res) => {
  try {
    const { uid, email, name, photoURL } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const normalizedEmail = normalizeEmail(email)
    const usersCollection = getUsersCollection()
    const now = new Date()
    const existingUser = await usersCollection.findOne({ email: normalizedEmail })

    if (existingUser) {
      await usersCollection.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            uid: uid || existingUser.uid || '',
            email: normalizedEmail,
            name: name || existingUser.name || normalizedEmail.split('@')[0],
            photoURL: photoURL || existingUser.photoURL || '',
            role: resolveUserRole(normalizedEmail, existingUser.role || 'user'),
            updatedAt: now,
          },
        },
      )

      const updatedUser = await usersCollection.findOne({ _id: existingUser._id })
      return res.json({ user: toUserResponse(updatedUser) })
    }

    const newUser = {
      uid: uid || '',
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      photoURL: photoURL || '',
      role: resolveUserRole(normalizedEmail),
      createdAt: now,
      updatedAt: now,
    }

    const result = await usersCollection.insertOne(newUser)

    return res.status(201).json({
      user: toUserResponse({ ...newUser, _id: result.insertedId }),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to sync user' })
  }
})

app.get('/api/users/role', async (req, res) => {
  try {
    const email = req.query.email

    if (!email) {
      return res.status(400).json({ error: 'Email query is required' })
    }

    const normalizedEmail = normalizeEmail(email)
    const user = await getUsersCollection().findOne(
      { email: normalizedEmail },
      { projection: { role: 1, email: 1, name: 1 } },
    )

    if (!user) {
      return res.json({
        role: resolveUserRole(normalizedEmail),
        email: normalizedEmail,
        name: '',
      })
    }

    return res.json({
      role: resolveUserRole(normalizedEmail, user.role || 'user'),
      email: user.email,
      name: user.name || '',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to get user role' })
  }
})

app.get('/api/blog-comments', async (_req, res) => {
  try {
    const items = await getBlogCommentsCollection()
      .find({})
      .sort({ createdAt: -1 })
      .limit(150)
      .toArray()

    return res.json({
      comments: items.map((c) => ({
        _id: c._id.toString(),
        text: c.text,
        authorName: c.authorName || '',
        authorEmail: c.authorEmail || '',
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      })),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

app.post('/api/blog-comments', async (req, res) => {
  try {
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : ''
    const email = normalizeEmail(req.body.email || '')
    const uid = typeof req.body.uid === 'string' ? req.body.uid.trim() : ''
    const nameRaw = typeof req.body.name === 'string' ? req.body.name.trim() : ''

    if (!text || text.length > 3000) {
      return res.status(400).json({ error: 'Comment is required (max 3000 characters)' })
    }
    if (!email || !uid) {
      return res.status(400).json({ error: 'Missing user identity' })
    }

    const dbUser = await getUsersCollection().findOne({ email, uid })
    if (!dbUser) {
      return res.status(401).json({
        error: 'You must be logged in with a synced account to post a comment',
      })
    }

    const authorName = nameRaw || dbUser.name || email.split('@')[0]

    const doc = {
      text,
      authorEmail: email,
      authorName,
      authorUid: uid,
      createdAt: new Date(),
    }

    const result = await getBlogCommentsCollection().insertOne(doc)

    return res.status(201).json({
      message: 'Comment posted',
      comment: {
        _id: result.insertedId.toString(),
        text: doc.text,
        authorName: doc.authorName,
        authorEmail: doc.authorEmail,
        createdAt: doc.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to post comment' })
  }
})

app.delete('/api/blog-comments/:commentId', async (req, res) => {
  try {
    const moderatorEmail = normalizeEmail(req.query.moderatorEmail || '')
    if (!moderatorEmail || !ADMIN_EMAILS.includes(moderatorEmail)) {
      return res.status(403).json({ error: 'Moderator access denied' })
    }

    const { commentId } = req.params
    let objectId
    try {
      objectId = new ObjectId(commentId)
    } catch {
      return res.status(400).json({ error: 'Invalid comment id' })
    }

    const result = await getBlogCommentsCollection().deleteOne({ _id: objectId })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    return res.json({ message: 'Comment deleted' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete comment' })
  }
})

app.get('/api/users', async (_req, res) => {
  try {
    const users = await getUsersCollection().find({}).sort({ createdAt: -1 }).toArray()
    return res.json({
      users: users.map((user) => toUserResponse(user)),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch users' })
  }
})

app.patch('/api/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be user or admin' })
    }

    const usersCollection = getUsersCollection()
    const objectId = new ObjectId(id)
    const existingUser = await usersCollection.findOne({ _id: objectId })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    await usersCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
    )

    const updatedUser = await usersCollection.findOne({ _id: objectId })

    return res.json({
      message: 'User role updated',
      user: toUserResponse(updatedUser),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update role' })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await getUsersCollection().deleteOne({ _id: new ObjectId(id) })

    if (!result.deletedCount) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({ message: 'User removed successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete user' })
  }
})

app.get('/api/services-page', async (_req, res) => {
  try {
    const [services, pageContent] = await Promise.all([
      getServicesCollection().find({}).sort({ createdAt: 1 }).toArray(),
      getPageContentCollection().findOne({ key: 'services-page' }),
    ])

    return res.json({
      heroImage: pageContent?.heroImage || '',
      missionVideo: pageContent?.missionVideo || '',
      heroTitle: pageContent?.heroTitle || 'Services',
      sectionLabel: pageContent?.sectionLabel || 'Our Services',
      sectionTitle: pageContent?.sectionTitle || 'We Provide The Best Services',
      missionTitle: pageContent?.missionTitle || 'Mission is to Growth Your Business & More',
      services: services.map((service) => normalizeDocument(service)),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch services page data' })
  }
})

app.put('/api/services-page', async (req, res) => {
  try {
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      missionVideo: typeof req.body.missionVideo === 'string' ? req.body.missionVideo.trim() : '',
      heroTitle: typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Services',
      sectionLabel:
        typeof req.body.sectionLabel === 'string' ? req.body.sectionLabel.trim() : 'Our Services',
      sectionTitle:
        typeof req.body.sectionTitle === 'string'
          ? req.body.sectionTitle.trim()
          : 'We Provide The Best Services',
      missionTitle:
        typeof req.body.missionTitle === 'string'
          ? req.body.missionTitle.trim()
          : 'Mission is to Growth Your Business & More',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'services-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: 'services-page',
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'services-page' })

    return res.json({
      message: 'Services page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update services page content' })
  }
})

app.get('/api/services', async (_req, res) => {
  try {
    const services = await getServicesCollection().find({}).sort({ createdAt: 1 }).toArray()
    return res.json({
      services: services.map((service) => normalizeDocument(service)),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch services' })
  }
})

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await getServicesCollection().findOne({ _id: new ObjectId(req.params.id) })

    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    return res.json({ service: normalizeDocument(service) })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch service' })
  }
})

app.post('/api/services', async (req, res) => {
  try {
    const { errors, value } = validateServicePayload(req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const newService = {
      ...value,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await getServicesCollection().insertOne(newService)

    return res.status(201).json({
      message: 'Service created successfully',
      service: normalizeDocument({ ...newService, _id: result.insertedId }),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create service' })
  }
})

app.put('/api/services/:id', async (req, res) => {
  try {
    const { errors, value } = validateServicePayload(req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const objectId = new ObjectId(req.params.id)
    const result = await getServicesCollection().updateOne(
      { _id: objectId },
      {
        $set: {
          ...value,
          updatedAt: new Date(),
        },
      },
    )

    if (!result.matchedCount) {
      return res.status(404).json({ error: 'Service not found' })
    }

    const updatedService = await getServicesCollection().findOne({ _id: objectId })

    return res.json({
      message: 'Service updated successfully',
      service: normalizeDocument(updatedService),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update service' })
  }
})

app.patch('/api/services/:id', async (req, res) => {
  try {
    const { errors, value } = validateServicePayload(req.body, { partial: true })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const objectId = new ObjectId(req.params.id)
    const result = await getServicesCollection().updateOne(
      { _id: objectId },
      {
        $set: {
          ...value,
          updatedAt: new Date(),
        },
      },
    )

    if (!result.matchedCount) {
      return res.status(404).json({ error: 'Service not found' })
    }

    const updatedService = await getServicesCollection().findOne({ _id: objectId })

    return res.json({
      message: 'Service updated successfully',
      service: normalizeDocument(updatedService),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update service' })
  }
})

app.delete('/api/services/:id', async (req, res) => {
  try {
    const result = await getServicesCollection().deleteOne({ _id: new ObjectId(req.params.id) })

    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Service not found' })
    }

    return res.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete service' })
  }
})

app.get('/api/information-security-page', async (_req, res) => {
  try {
    const page = await getInformationSecurityPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch information security page data' })
  }
})

app.put('/api/information-security-page', async (req, res) => {
  try {
    const defaultPage = getDefaultInformationSecurityPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      mainImage: typeof req.body.mainImage === 'string' ? req.body.mainImage.trim() : '',
      heroTitle:
        typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Information Security',
      sectionTitle:
        typeof req.body.sectionTitle === 'string'
          ? req.body.sectionTitle.trim()
          : 'Information Security',
      sectionDescription:
        typeof req.body.sectionDescription === 'string' ? req.body.sectionDescription.trim() : '',
      bottomDescription:
        typeof req.body.bottomDescription === 'string' ? req.body.bottomDescription.trim() : '',
      brochuresTitle:
        typeof req.body.brochuresTitle === 'string' ? req.body.brochuresTitle.trim() : 'Brochures',
      brochuresDescription:
        typeof req.body.brochuresDescription === 'string' ? req.body.brochuresDescription.trim() : '',
      brochuresPrimaryButton:
        typeof req.body.brochuresPrimaryButton === 'string'
          ? req.body.brochuresPrimaryButton.trim()
          : 'Download',
      brochuresSecondaryButton:
        typeof req.body.brochuresSecondaryButton === 'string'
          ? req.body.brochuresSecondaryButton.trim()
          : 'Discover',
      followUsTitle:
        typeof req.body.followUsTitle === 'string' ? req.body.followUsTitle.trim() : 'Follow Us',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'information-security-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          faqs: defaultPage.faqs,
          highlights: defaultPage.highlights,
          socials: defaultPage.socials,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'information-security-page' })
    return res.json({
      message: 'Information security page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update information security page content' })
  }
})

app.post('/api/information-security-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = informationSecuritySections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateInformationSecurityArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getInformationSecurityPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'information-security-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create information security section item' })
  }
})

app.patch('/api/information-security-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = informationSecuritySections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateInformationSecurityArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getInformationSecurityPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'information-security-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update information security section item' })
  }
})

app.delete('/api/information-security-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = informationSecuritySections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getInformationSecurityPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'information-security-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete information security section item' })
  }
})

app.get('/api/mobile-platform-page', async (_req, res) => {
  try {
    const page = await getMobilePlatformPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch mobile platform page data' })
  }
})

app.put('/api/mobile-platform-page', async (req, res) => {
  try {
    const defaultPage = getDefaultMobilePlatformPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      topImageLeft: typeof req.body.topImageLeft === 'string' ? req.body.topImageLeft.trim() : '',
      topImageRight: typeof req.body.topImageRight === 'string' ? req.body.topImageRight.trim() : '',
      heroTitle: typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Mobile Platforms',
      sectionTitle: typeof req.body.sectionTitle === 'string' ? req.body.sectionTitle.trim() : 'Mobile Platforms',
      sectionDescription: typeof req.body.sectionDescription === 'string' ? req.body.sectionDescription.trim() : '',
      bottomDescription: typeof req.body.bottomDescription === 'string' ? req.body.bottomDescription.trim() : '',
      mainServicesTitle:
        typeof req.body.mainServicesTitle === 'string' ? req.body.mainServicesTitle.trim() : 'Main Services',
      brochuresTitle: typeof req.body.brochuresTitle === 'string' ? req.body.brochuresTitle.trim() : 'Brochures',
      brochuresDescription:
        typeof req.body.brochuresDescription === 'string' ? req.body.brochuresDescription.trim() : '',
      brochuresPrimaryButton:
        typeof req.body.brochuresPrimaryButton === 'string'
          ? req.body.brochuresPrimaryButton.trim()
          : 'Download',
      brochuresSecondaryButton:
        typeof req.body.brochuresSecondaryButton === 'string'
          ? req.body.brochuresSecondaryButton.trim()
          : 'Discover',
      followUsTitle:
        typeof req.body.followUsTitle === 'string' ? req.body.followUsTitle.trim() : 'Follow Us',
      teamTitle: typeof req.body.teamTitle === 'string' ? req.body.teamTitle.trim() : 'Our Team',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'mobile-platform-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          socials: defaultPage.socials,
          checklist: defaultPage.checklist,
          team: defaultPage.team,
          skills: defaultPage.skills,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'mobile-platform-page' })
    return res.json({
      message: 'Mobile platform page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update mobile platform page content' })
  }
})

app.post('/api/mobile-platform-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = mobilePlatformSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateMobilePlatformArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getMobilePlatformPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'mobile-platform-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create mobile platform section item' })
  }
})

app.patch('/api/mobile-platform-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = mobilePlatformSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateMobilePlatformArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getMobilePlatformPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'mobile-platform-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update mobile platform section item' })
  }
})

app.delete('/api/mobile-platform-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = mobilePlatformSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getMobilePlatformPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'mobile-platform-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete mobile platform section item' })
  }
})

app.get('/api/data-synchronization-page', async (_req, res) => {
  try {
    const page = await getDataSynchronizationPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch data synchronization page data' })
  }
})

app.put('/api/data-synchronization-page', async (req, res) => {
  try {
    const defaultPage = getDefaultDataSynchronizationPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      mainImage: typeof req.body.mainImage === 'string' ? req.body.mainImage.trim() : '',
      heroTitle:
        typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Data Synchronization',
      sectionTitle:
        typeof req.body.sectionTitle === 'string' ? req.body.sectionTitle.trim() : 'Data Synchronization',
      sectionDescription:
        typeof req.body.sectionDescription === 'string' ? req.body.sectionDescription.trim() : '',
      bottomDescriptionTop:
        typeof req.body.bottomDescriptionTop === 'string' ? req.body.bottomDescriptionTop.trim() : '',
      bottomDescriptionBottom:
        typeof req.body.bottomDescriptionBottom === 'string' ? req.body.bottomDescriptionBottom.trim() : '',
      mainServicesTitle:
        typeof req.body.mainServicesTitle === 'string' ? req.body.mainServicesTitle.trim() : 'Main Services',
      brochuresTitle: typeof req.body.brochuresTitle === 'string' ? req.body.brochuresTitle.trim() : 'Brochures',
      brochuresDescription:
        typeof req.body.brochuresDescription === 'string' ? req.body.brochuresDescription.trim() : '',
      brochuresPrimaryButton:
        typeof req.body.brochuresPrimaryButton === 'string'
          ? req.body.brochuresPrimaryButton.trim()
          : 'Download',
      brochuresOrLabel: typeof req.body.brochuresOrLabel === 'string' ? req.body.brochuresOrLabel.trim() : 'OR',
      brochuresSecondaryButton:
        typeof req.body.brochuresSecondaryButton === 'string'
          ? req.body.brochuresSecondaryButton.trim()
          : 'Discover',
      followUsTitle:
        typeof req.body.followUsTitle === 'string' ? req.body.followUsTitle.trim() : 'Follow Us',
      quoteText: typeof req.body.quoteText === 'string' ? req.body.quoteText.trim() : '',
      quoteAuthor: typeof req.body.quoteAuthor === 'string' ? req.body.quoteAuthor.trim() : '',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'data-synchronization-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          socials: defaultPage.socials,
          featureCards: defaultPage.featureCards,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'data-synchronization-page' })
    return res.json({
      message: 'Data synchronization page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update data synchronization page content' })
  }
})

app.post('/api/data-synchronization-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = dataSynchronizationSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateDataSynchronizationArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getDataSynchronizationPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'data-synchronization-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create data synchronization section item' })
  }
})

app.patch('/api/data-synchronization-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = dataSynchronizationSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateDataSynchronizationArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getDataSynchronizationPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'data-synchronization-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update data synchronization section item' })
  }
})

app.delete('/api/data-synchronization-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = dataSynchronizationSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getDataSynchronizationPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'data-synchronization-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete data synchronization section item' })
  }
})

app.get('/api/process-automation-page', async (_req, res) => {
  try {
    const page = await getProcessAutomationPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch process automation page data' })
  }
})

app.put('/api/process-automation-page', async (req, res) => {
  try {
    const defaultPage = getDefaultProcessAutomationPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      heroStripImage: typeof req.body.heroStripImage === 'string' ? req.body.heroStripImage.trim() : '',
      heroTitle: typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Process Automation',
      sectionTitle:
        typeof req.body.sectionTitle === 'string' ? req.body.sectionTitle.trim() : 'Process Automation',
      sectionDescription:
        typeof req.body.sectionDescription === 'string' ? req.body.sectionDescription.trim() : '',
      sectionDescriptionBottom:
        typeof req.body.sectionDescriptionBottom === 'string' ? req.body.sectionDescriptionBottom.trim() : '',
      finalDescription: typeof req.body.finalDescription === 'string' ? req.body.finalDescription.trim() : '',
      stripLabel: typeof req.body.stripLabel === 'string' ? req.body.stripLabel.trim() : 'Automation',
      mainServicesTitle:
        typeof req.body.mainServicesTitle === 'string' ? req.body.mainServicesTitle.trim() : 'Main Services',
      brochuresTitle: typeof req.body.brochuresTitle === 'string' ? req.body.brochuresTitle.trim() : 'Brochures',
      brochuresDescription:
        typeof req.body.brochuresDescription === 'string' ? req.body.brochuresDescription.trim() : '',
      brochuresPrimaryButton:
        typeof req.body.brochuresPrimaryButton === 'string'
          ? req.body.brochuresPrimaryButton.trim()
          : 'Download',
      brochuresOrLabel: typeof req.body.brochuresOrLabel === 'string' ? req.body.brochuresOrLabel.trim() : 'OR',
      brochuresSecondaryButton:
        typeof req.body.brochuresSecondaryButton === 'string'
          ? req.body.brochuresSecondaryButton.trim()
          : 'Discover',
      followUsTitle:
        typeof req.body.followUsTitle === 'string' ? req.body.followUsTitle.trim() : 'Follow Us',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'process-automation-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          socials: defaultPage.socials,
          cards: defaultPage.cards,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'process-automation-page' })
    return res.json({
      message: 'Process automation page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update process automation page content' })
  }
})

app.post('/api/process-automation-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = processAutomationSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateProcessAutomationArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getProcessAutomationPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'process-automation-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create process automation section item' })
  }
})

app.patch('/api/process-automation-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = processAutomationSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateProcessAutomationArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getProcessAutomationPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'process-automation-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update process automation section item' })
  }
})

app.delete('/api/process-automation-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = processAutomationSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getProcessAutomationPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'process-automation-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete process automation section item' })
  }
})

app.get('/api/educational-institute-management-page', async (_req, res) => {
  try {
    const page = await getEducationalInstituteManagementPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch educational institute management page data' })
  }
})

app.put('/api/educational-institute-management-page', async (req, res) => {
  try {
    const defaultPage = getDefaultEducationalInstituteManagementPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      heroStripImage: typeof req.body.heroStripImage === 'string' ? req.body.heroStripImage.trim() : '',
      heroTitle:
        typeof req.body.heroTitle === 'string'
          ? req.body.heroTitle.trim()
          : 'Educational Institute Management Software',
      sectionTitle:
        typeof req.body.sectionTitle === 'string' ? req.body.sectionTitle.trim() : 'One platform for your entire campus',
      sectionDescription:
        typeof req.body.sectionDescription === 'string' ? req.body.sectionDescription.trim() : '',
      sectionDescriptionBottom:
        typeof req.body.sectionDescriptionBottom === 'string' ? req.body.sectionDescriptionBottom.trim() : '',
      finalDescription: typeof req.body.finalDescription === 'string' ? req.body.finalDescription.trim() : '',
      stripLabel: typeof req.body.stripLabel === 'string' ? req.body.stripLabel.trim() : 'EIMS',
      mainServicesTitle:
        typeof req.body.mainServicesTitle === 'string' ? req.body.mainServicesTitle.trim() : 'Main Services',
      brochuresTitle: typeof req.body.brochuresTitle === 'string' ? req.body.brochuresTitle.trim() : 'Brochures',
      brochuresDescription:
        typeof req.body.brochuresDescription === 'string' ? req.body.brochuresDescription.trim() : '',
      brochuresPrimaryButton:
        typeof req.body.brochuresPrimaryButton === 'string'
          ? req.body.brochuresPrimaryButton.trim()
          : 'Download',
      brochuresOrLabel: typeof req.body.brochuresOrLabel === 'string' ? req.body.brochuresOrLabel.trim() : 'OR',
      brochuresSecondaryButton:
        typeof req.body.brochuresSecondaryButton === 'string'
          ? req.body.brochuresSecondaryButton.trim()
          : 'Discover',
      followUsTitle:
        typeof req.body.followUsTitle === 'string' ? req.body.followUsTitle.trim() : 'Follow Us',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'educational-institute-management-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          socials: defaultPage.socials,
          cards: defaultPage.cards,
          featureBullets: defaultPage.featureBullets,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'educational-institute-management-page' })
    return res.json({
      message: 'Educational institute management page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update educational institute management page content' })
  }
})

app.post('/api/educational-institute-management-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = educationalInstituteManagementSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateEducationalInstituteManagementArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getEducationalInstituteManagementPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'educational-institute-management-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create educational institute management section item' })
  }
})

app.patch('/api/educational-institute-management-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = educationalInstituteManagementSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateEducationalInstituteManagementArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getEducationalInstituteManagementPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'educational-institute-management-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update educational institute management section item' })
  }
})

app.delete('/api/educational-institute-management-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = educationalInstituteManagementSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getEducationalInstituteManagementPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'educational-institute-management-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete educational institute management section item' })
  }
})

app.get('/api/erp-software-page', async (_req, res) => {
  try {
    const page = await getErpSoftwarePageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch ERP software page data' })
  }
})

app.put('/api/erp-software-page', async (req, res) => {
  try {
    const defaultPage = getDefaultErpSoftwarePage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      heroStripImage: typeof req.body.heroStripImage === 'string' ? req.body.heroStripImage.trim() : '',
      heroTitle: typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'ERP Software',
      sectionTitle:
        typeof req.body.sectionTitle === 'string'
          ? req.body.sectionTitle.trim()
          : 'Enterprise Resource Planning — one connected backbone',
      sectionDescription:
        typeof req.body.sectionDescription === 'string' ? req.body.sectionDescription.trim() : '',
      sectionDescriptionBottom:
        typeof req.body.sectionDescriptionBottom === 'string' ? req.body.sectionDescriptionBottom.trim() : '',
      finalDescription: typeof req.body.finalDescription === 'string' ? req.body.finalDescription.trim() : '',
      stripLabel: typeof req.body.stripLabel === 'string' ? req.body.stripLabel.trim() : 'ERP',
      mainServicesTitle:
        typeof req.body.mainServicesTitle === 'string' ? req.body.mainServicesTitle.trim() : 'Main Services',
      brochuresTitle: typeof req.body.brochuresTitle === 'string' ? req.body.brochuresTitle.trim() : 'Brochures',
      brochuresDescription:
        typeof req.body.brochuresDescription === 'string' ? req.body.brochuresDescription.trim() : '',
      brochuresPrimaryButton:
        typeof req.body.brochuresPrimaryButton === 'string'
          ? req.body.brochuresPrimaryButton.trim()
          : 'Download',
      brochuresOrLabel: typeof req.body.brochuresOrLabel === 'string' ? req.body.brochuresOrLabel.trim() : 'OR',
      brochuresSecondaryButton:
        typeof req.body.brochuresSecondaryButton === 'string'
          ? req.body.brochuresSecondaryButton.trim()
          : 'Discover',
      followUsTitle:
        typeof req.body.followUsTitle === 'string' ? req.body.followUsTitle.trim() : 'Follow Us',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'erp-software-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          socials: defaultPage.socials,
          cards: defaultPage.cards,
          featureBullets: defaultPage.featureBullets,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'erp-software-page' })
    return res.json({
      message: 'ERP software page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update ERP software page content' })
  }
})

app.post('/api/erp-software-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = erpSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateErpSoftwareArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getErpSoftwarePageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'erp-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create ERP software section item' })
  }
})

app.patch('/api/erp-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = erpSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateErpSoftwareArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getErpSoftwarePageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'erp-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update ERP software section item' })
  }
})

app.delete('/api/erp-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = erpSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getErpSoftwarePageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'erp-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete ERP software section item' })
  }
})

app.get('/api/hospital-management-software-page', async (_req, res) => {
  try {
    const page = await getHospitalManagementSoftwarePageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch hospital management software page data' })
  }
})

app.put('/api/hospital-management-software-page', async (req, res) => {
  try {
    const defaultPage = getDefaultHospitalManagementSoftwarePage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      heroTitle:
        typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Hospital Management Software',
      stripLabel: typeof req.body.stripLabel === 'string' ? req.body.stripLabel.trim() : 'HMS',
      stripImage: typeof req.body.stripImage === 'string' ? req.body.stripImage.trim() : '',
      stripCaption:
        typeof req.body.stripCaption === 'string'
          ? req.body.stripCaption.trim()
          : defaultPage.stripCaption,
      sectionTitle:
        typeof req.body.sectionTitle === 'string'
          ? req.body.sectionTitle.trim()
          : 'Clinical workflows, billing, and diagnostics — unified',
      sectionLead: typeof req.body.sectionLead === 'string' ? req.body.sectionLead.trim() : '',
      sectionSecondary: typeof req.body.sectionSecondary === 'string' ? req.body.sectionSecondary.trim() : '',
      modulesEyebrow:
        typeof req.body.modulesEyebrow === 'string' ? req.body.modulesEyebrow.trim() : 'Coverage',
      modulesTitle:
        typeof req.body.modulesTitle === 'string'
          ? req.body.modulesTitle.trim()
          : 'Modules that mirror your hospital',
      timelineTitle:
        typeof req.body.timelineTitle === 'string' ? req.body.timelineTitle.trim() : 'Why teams choose this stack',
      faqsTitle: typeof req.body.faqsTitle === 'string' ? req.body.faqsTitle.trim() : 'Common questions',
      asideTitle: typeof req.body.asideTitle === 'string' ? req.body.asideTitle.trim() : 'Explore services',
      asideBody: typeof req.body.asideBody === 'string' ? req.body.asideBody.trim() : '',
      asideCtaLabel:
        typeof req.body.asideCtaLabel === 'string' ? req.body.asideCtaLabel.trim() : 'View all services',
      primaryCtaLabel:
        typeof req.body.primaryCtaLabel === 'string' ? req.body.primaryCtaLabel.trim() : 'Talk to us',
      secondaryCtaLabel:
        typeof req.body.secondaryCtaLabel === 'string' ? req.body.secondaryCtaLabel.trim() : 'How we work',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'hospital-management-software-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          stats: defaultPage.stats,
          modules: defaultPage.modules,
          timeline: defaultPage.timeline,
          spotlight: defaultPage.spotlight,
          faqs: defaultPage.faqs,
          asideLinks: defaultPage.asideLinks,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'hospital-management-software-page' })
    return res.json({
      message: 'Hospital management software page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update hospital management software page content' })
  }
})

app.post('/api/hospital-management-software-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = hospitalManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateHospitalManagementSoftwareArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getHospitalManagementSoftwarePageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'hospital-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create hospital management software section item' })
  }
})

app.patch('/api/hospital-management-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = hospitalManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateHospitalManagementSoftwareArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getHospitalManagementSoftwarePageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'hospital-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update hospital management software section item' })
  }
})

app.delete('/api/hospital-management-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = hospitalManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getHospitalManagementSoftwarePageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'hospital-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete hospital management software section item' })
  }
})

app.get('/api/pharmacy-management-software-page', async (_req, res) => {
  try {
    const page = await getPharmacyManagementSoftwarePageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch pharmacy management software page data' })
  }
})

app.put('/api/pharmacy-management-software-page', async (req, res) => {
  try {
    const defaultPage = getDefaultPharmacyManagementSoftwarePage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      heroTitle:
        typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Pharmacy Management Software',
      stripLabel: typeof req.body.stripLabel === 'string' ? req.body.stripLabel.trim() : 'Rx',
      heroBadge: typeof req.body.heroBadge === 'string' ? req.body.heroBadge.trim() : 'Pharmacy suite',
      introKicker:
        typeof req.body.introKicker === 'string'
          ? req.body.introKicker.trim()
          : 'Retail & wholesale — one counter, one ledger',
      introTitle:
        typeof req.body.introTitle === 'string'
          ? req.body.introTitle.trim()
          : 'Stock, compliance, and checkout without spreadsheet chaos',
      introLead: typeof req.body.introLead === 'string' ? req.body.introLead.trim() : '',
      introSecondary: typeof req.body.introSecondary === 'string' ? req.body.introSecondary.trim() : '',
      introAside:
        typeof req.body.introAside === 'string'
          ? req.body.introAside.trim()
          : defaultPage.introAside,
      capabilitiesEyebrow:
        typeof req.body.capabilitiesEyebrow === 'string' ? req.body.capabilitiesEyebrow.trim() : 'Deep dive',
      capabilitiesTitle:
        typeof req.body.capabilitiesTitle === 'string'
          ? req.body.capabilitiesTitle.trim()
          : 'What the suite actually covers',
      honeycombTitle:
        typeof req.body.honeycombTitle === 'string' ? req.body.honeycombTitle.trim() : 'Modules at a glance',
      honeycombLead:
        typeof req.body.honeycombLead === 'string'
          ? req.body.honeycombLead.trim()
          : defaultPage.honeycombLead,
      faqsTitle:
        typeof req.body.faqsTitle === 'string' ? req.body.faqsTitle.trim() : 'Questions teams ask first',
      primaryCtaLabel:
        typeof req.body.primaryCtaLabel === 'string' ? req.body.primaryCtaLabel.trim() : 'Talk to us',
      secondaryCtaLabel:
        typeof req.body.secondaryCtaLabel === 'string' ? req.body.secondaryCtaLabel.trim() : 'How we work',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'pharmacy-management-software-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          highlights: defaultPage.highlights,
          capabilities: defaultPage.capabilities,
          honeycomb: defaultPage.honeycomb,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'pharmacy-management-software-page' })
    return res.json({
      message: 'Pharmacy management software page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update pharmacy management software page content' })
  }
})

app.post('/api/pharmacy-management-software-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = pharmacyManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validatePharmacyManagementSoftwareArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getPharmacyManagementSoftwarePageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'pharmacy-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create pharmacy management software section item' })
  }
})

app.patch('/api/pharmacy-management-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = pharmacyManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validatePharmacyManagementSoftwareArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getPharmacyManagementSoftwarePageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'pharmacy-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update pharmacy management software section item' })
  }
})

app.delete('/api/pharmacy-management-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = pharmacyManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getPharmacyManagementSoftwarePageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'pharmacy-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete pharmacy management software section item' })
  }
})

app.get('/api/restaurant-management-software-page', async (_req, res) => {
  try {
    const page = await getRestaurantManagementSoftwarePageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch restaurant management software page data' })
  }
})

app.put('/api/restaurant-management-software-page', async (req, res) => {
  try {
    const defaultPage = getDefaultRestaurantManagementSoftwarePage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      heroTitle:
        typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Restaurant Management Software',
      heroLead: typeof req.body.heroLead === 'string' ? req.body.heroLead.trim() : defaultPage.heroLead,
      heroBadge:
        typeof req.body.heroBadge === 'string' ? req.body.heroBadge.trim() : 'Dine in. Takeaway. Delivery.',
      coreTitle:
        typeof req.body.coreTitle === 'string'
          ? req.body.coreTitle.trim()
          : 'One platform across front-of-house and back-of-house',
      coreBody: typeof req.body.coreBody === 'string' ? req.body.coreBody.trim() : defaultPage.coreBody,
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'restaurant-management-software-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          topPills: defaultPage.topPills,
          modules: defaultPage.modules,
          spotlight: defaultPage.spotlight,
          timeline: defaultPage.timeline,
          stats: defaultPage.stats,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'restaurant-management-software-page' })
    return res.json({
      message: 'Restaurant management software page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update restaurant management software page content' })
  }
})

app.post('/api/restaurant-management-software-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = restaurantManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateRestaurantManagementSoftwareArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getRestaurantManagementSoftwarePageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'restaurant-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create restaurant management software section item' })
  }
})

app.patch('/api/restaurant-management-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = restaurantManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateRestaurantManagementSoftwareArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getRestaurantManagementSoftwarePageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'restaurant-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update restaurant management software section item' })
  }
})

app.delete('/api/restaurant-management-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = restaurantManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getRestaurantManagementSoftwarePageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'restaurant-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete restaurant management software section item' })
  }
})

app.get('/api/inventory-management-software-page', async (_req, res) => {
  try {
    const page = await getInventoryManagementSoftwarePageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch inventory management software page data' })
  }
})

app.put('/api/inventory-management-software-page', async (req, res) => {
  try {
    const defaultPage = getDefaultInventoryManagementSoftwarePage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      heroTitle:
        typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Inventory Management Software',
      heroLead: typeof req.body.heroLead === 'string' ? req.body.heroLead.trim() : defaultPage.heroLead,
      heroBadge:
        typeof req.body.heroBadge === 'string' ? req.body.heroBadge.trim() : 'Stock. Control. Visibility.',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'inventory-management-software-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          overviewCards: defaultPage.overviewCards,
          operationsFlow: defaultPage.operationsFlow,
          integrationGrid: defaultPage.integrationGrid,
          outcomes: defaultPage.outcomes,
          capabilities: defaultPage.capabilities,
          metrics: defaultPage.metrics,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'inventory-management-software-page' })
    return res.json({
      message: 'Inventory management software page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update inventory management software page content' })
  }
})

app.post('/api/inventory-management-software-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = inventoryManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateInventoryManagementSoftwareArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getInventoryManagementSoftwarePageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'inventory-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create inventory management software section item' })
  }
})

app.patch('/api/inventory-management-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = inventoryManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateInventoryManagementSoftwareArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getInventoryManagementSoftwarePageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'inventory-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update inventory management software section item' })
  }
})

app.delete('/api/inventory-management-software-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = inventoryManagementSoftwareSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getInventoryManagementSoftwarePageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'inventory-management-software-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete inventory management software section item' })
  }
})

app.get('/api/municipality-union-management-page', async (_req, res) => {
  try {
    const page = await getMunicipalityUnionManagementPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch municipality union management page data' })
  }
})

app.put('/api/municipality-union-management-page', async (req, res) => {
  try {
    const defaultPage = getDefaultMunicipalityUnionManagementPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      heroBadge: typeof req.body.heroBadge === 'string' ? req.body.heroBadge.trim() : 'Smart Governance',
      heroTitle:
        typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Municipality / Union Management',
      heroLead: typeof req.body.heroLead === 'string' ? req.body.heroLead.trim() : defaultPage.heroLead,
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'municipality-union-management-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          civicModules: defaultPage.civicModules,
          processTimeline: defaultPage.processTimeline,
          performanceCards: defaultPage.performanceCards,
          governanceFeatures: defaultPage.governanceFeatures,
          faq: defaultPage.faq,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'municipality-union-management-page' })
    return res.json({
      message: 'Municipality union management page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update municipality union management page content' })
  }
})

app.post('/api/municipality-union-management-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = municipalityUnionManagementSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateMunicipalityUnionManagementArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getMunicipalityUnionManagementPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'municipality-union-management-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create municipality union management section item' })
  }
})

app.patch('/api/municipality-union-management-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = municipalityUnionManagementSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateMunicipalityUnionManagementArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getMunicipalityUnionManagementPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'municipality-union-management-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update municipality union management section item' })
  }
})

app.delete('/api/municipality-union-management-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = municipalityUnionManagementSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getMunicipalityUnionManagementPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'municipality-union-management-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete municipality union management section item' })
  }
})

app.get('/api/payment-gateways-page', async (_req, res) => {
  try {
    const page = await getPaymentGatewaysPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch payment gateways page data' })
  }
})

app.put('/api/payment-gateways-page', async (req, res) => {
  try {
    const defaultPage = getDefaultPaymentGatewaysPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      heroBadge: typeof req.body.heroBadge === 'string' ? req.body.heroBadge.trim() : defaultPage.heroBadge,
      heroTitle: typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : defaultPage.heroTitle,
      heroLead: typeof req.body.heroLead === 'string' ? req.body.heroLead.trim() : defaultPage.heroLead,
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'payment-gateways-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          heroStats: defaultPage.heroStats,
          serviceLinks: defaultPage.serviceLinks,
          rails: defaultPage.rails,
          partnerChannels: defaultPage.partnerChannels,
          flowSteps: defaultPage.flowSteps,
          riskLayers: defaultPage.riskLayers,
          walletCapabilities: defaultPage.walletCapabilities,
          metrics: defaultPage.metrics,
          businessUseCases: defaultPage.businessUseCases,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'payment-gateways-page' })
    return res.json({
      message: 'Payment gateways page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update payment gateways page content' })
  }
})

app.post('/api/payment-gateways-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = paymentGatewaysSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validatePaymentGatewaysArrayItem(targetSection, req.body)
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getPaymentGatewaysPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'payment-gateways-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create payment gateways section item' })
  }
})

app.patch('/api/payment-gateways-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = paymentGatewaysSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validatePaymentGatewaysArrayItem(targetSection, req.body, { partial: true })
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getPaymentGatewaysPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'payment-gateways-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update payment gateways section item' })
  }
})

app.delete('/api/payment-gateways-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = paymentGatewaysSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getPaymentGatewaysPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'payment-gateways-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete payment gateways section item' })
  }
})

app.get('/api/website-development-page', async (_req, res) => {
  try {
    const page = await getWebsiteDevelopmentPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch website development page data' })
  }
})

app.put('/api/website-development-page', async (req, res) => {
  try {
    const defaultPage = getDefaultWebsiteDevelopmentPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      eyebrow: typeof req.body.eyebrow === 'string' ? req.body.eyebrow.trim() : defaultPage.eyebrow,
      title: typeof req.body.title === 'string' ? req.body.title.trim() : defaultPage.title,
      subtitle: typeof req.body.subtitle === 'string' ? req.body.subtitle.trim() : defaultPage.subtitle,
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'website-development-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          introPoints: defaultPage.introPoints,
          quickLinks: defaultPage.quickLinks,
          designPillars: defaultPage.designPillars,
          deliveryTracks: defaultPage.deliveryTracks,
          packageGrid: defaultPage.packageGrid,
          serviceDetails: defaultPage.serviceDetails,
          projectShowcase: defaultPage.projectShowcase,
          stack: defaultPage.stack,
          stats: defaultPage.stats,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'website-development-page' })
    return res.json({
      message: 'Website development page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update website development page content' })
  }
})

app.post('/api/website-development-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = websiteDevelopmentSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateWebsiteDevelopmentArrayItem(targetSection, req.body)
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getWebsiteDevelopmentPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'website-development-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create website development section item' })
  }
})

app.patch('/api/website-development-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = websiteDevelopmentSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateWebsiteDevelopmentArrayItem(targetSection, req.body, { partial: true })
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getWebsiteDevelopmentPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'website-development-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update website development section item' })
  }
})

app.delete('/api/website-development-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = websiteDevelopmentSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getWebsiteDevelopmentPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'website-development-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete website development section item' })
  }
})

app.get('/api/landing-page-design-page', async (_req, res) => {
  try {
    const page = await getLandingPageDesignPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch landing page design page data' })
  }
})

app.put('/api/landing-page-design-page', async (req, res) => {
  try {
    const defaultPage = getDefaultLandingPageDesignPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      badge: typeof req.body.badge === 'string' ? req.body.badge.trim() : defaultPage.badge,
      title: typeof req.body.title === 'string' ? req.body.title.trim() : defaultPage.title,
      subtitle: typeof req.body.subtitle === 'string' ? req.body.subtitle.trim() : defaultPage.subtitle,
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'landing-page-design-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          quickActions: defaultPage.quickActions,
          campaignTypes: defaultPage.campaignTypes,
          sectionBlocks: defaultPage.sectionBlocks,
          processFlow: defaultPage.processFlow,
          conversionStats: defaultPage.conversionStats,
          pricingCards: defaultPage.pricingCards,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'landing-page-design-page' })
    return res.json({
      message: 'Landing page design content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update landing page design content' })
  }
})

app.post('/api/landing-page-design-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = landingPageDesignSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateLandingPageDesignArrayItem(targetSection, req.body)
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getLandingPageDesignPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'landing-page-design-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create landing page design section item' })
  }
})

app.patch('/api/landing-page-design-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = landingPageDesignSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateLandingPageDesignArrayItem(targetSection, req.body, { partial: true })
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getLandingPageDesignPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'landing-page-design-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update landing page design section item' })
  }
})

app.delete('/api/landing-page-design-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = landingPageDesignSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getLandingPageDesignPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'landing-page-design-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete landing page design section item' })
  }
})

app.get('/api/ecommerce-news-portal-page', async (_req, res) => {
  try {
    const page = await getEcommerceNewsPortalPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch ecommerce news portal page data' })
  }
})

app.put('/api/ecommerce-news-portal-page', async (req, res) => {
  try {
    const defaultPage = getDefaultEcommerceNewsPortalPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      badge: typeof req.body.badge === 'string' ? req.body.badge.trim() : defaultPage.badge,
      title: typeof req.body.title === 'string' ? req.body.title.trim() : defaultPage.title,
      subtitle: typeof req.body.subtitle === 'string' ? req.body.subtitle.trim() : defaultPage.subtitle,
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'ecommerce-news-portal-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          quickLinks: defaultPage.quickLinks,
          commerceModules: defaultPage.commerceModules,
          newsroomFlow: defaultPage.newsroomFlow,
          monetizationCards: defaultPage.monetizationCards,
          architectureHighlights: defaultPage.architectureHighlights,
          audienceSolutions: defaultPage.audienceSolutions,
          integrationSuite: defaultPage.integrationSuite,
          packageGrid: defaultPage.packageGrid,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'ecommerce-news-portal-page' })
    return res.json({
      message: 'Ecommerce news portal content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update ecommerce news portal content' })
  }
})

app.post('/api/ecommerce-news-portal-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = ecommerceNewsPortalSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateEcommerceNewsPortalArrayItem(targetSection, req.body)
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getEcommerceNewsPortalPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'ecommerce-news-portal-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create ecommerce news portal section item' })
  }
})

app.patch('/api/ecommerce-news-portal-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = ecommerceNewsPortalSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateEcommerceNewsPortalArrayItem(targetSection, req.body, { partial: true })
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getEcommerceNewsPortalPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }
    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'ecommerce-news-portal-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update ecommerce news portal section item' })
  }
})

app.delete('/api/ecommerce-news-portal-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = ecommerceNewsPortalSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getEcommerceNewsPortalPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'ecommerce-news-portal-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete ecommerce news portal section item' })
  }
})

app.get('/api/domain-hosting-server-page', async (_req, res) => {
  try {
    const page = await getDomainHostingServerPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch domain hosting server page data' })
  }
})

app.put('/api/domain-hosting-server-page', async (req, res) => {
  try {
    const defaultPage = getDefaultDomainHostingServerPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      badge: typeof req.body.badge === 'string' ? req.body.badge.trim() : defaultPage.badge,
      title: typeof req.body.title === 'string' ? req.body.title.trim() : defaultPage.title,
      subtitle: typeof req.body.subtitle === 'string' ? req.body.subtitle.trim() : defaultPage.subtitle,
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'domain-hosting-server-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          quickLinks: defaultPage.quickLinks,
          domainServices: defaultPage.domainServices,
          hostingStacks: defaultPage.hostingStacks,
          serverOpsFlow: defaultPage.serverOpsFlow,
          supportPackages: defaultPage.supportPackages,
          securityCoverage: defaultPage.securityCoverage,
          migrationChecklist: defaultPage.migrationChecklist,
          platformCoverage: defaultPage.platformCoverage,
          reliabilityMetrics: defaultPage.reliabilityMetrics,
          faqs: defaultPage.faqs,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'domain-hosting-server-page' })
    return res.json({
      message: 'Domain hosting server page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update domain hosting server page content' })
  }
})

app.post('/api/domain-hosting-server-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = domainHostingServerSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateDomainHostingServerArrayItem(targetSection, req.body)
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getDomainHostingServerPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'domain-hosting-server-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create domain hosting server section item' })
  }
})

app.patch('/api/domain-hosting-server-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = domainHostingServerSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateDomainHostingServerArrayItem(targetSection, req.body, { partial: true })
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getDomainHostingServerPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }
    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'domain-hosting-server-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update domain hosting server section item' })
  }
})

app.delete('/api/domain-hosting-server-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = domainHostingServerSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getDomainHostingServerPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'domain-hosting-server-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete domain hosting server section item' })
  }
})

app.get('/api/event-processing-page', async (_req, res) => {
  try {
    const page = await getEventProcessingPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch event processing page data' })
  }
})

app.put('/api/event-processing-page', async (req, res) => {
  try {
    const defaultPage = getDefaultEventProcessingPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      leftImage: typeof req.body.leftImage === 'string' ? req.body.leftImage.trim() : '',
      rightImage: typeof req.body.rightImage === 'string' ? req.body.rightImage.trim() : '',
      heroTitle: typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Event Processing',
      sectionTitle:
        typeof req.body.sectionTitle === 'string' ? req.body.sectionTitle.trim() : 'Event Processing',
      sectionDescription:
        typeof req.body.sectionDescription === 'string' ? req.body.sectionDescription.trim() : '',
      leftColumnText: typeof req.body.leftColumnText === 'string' ? req.body.leftColumnText.trim() : '',
      benefitsSectionTitle:
        typeof req.body.benefitsSectionTitle === 'string'
          ? req.body.benefitsSectionTitle.trim()
          : 'Our work benefits',
      benefitsSectionDescription:
        typeof req.body.benefitsSectionDescription === 'string'
          ? req.body.benefitsSectionDescription.trim()
          : '',
      benefitReadMoreLabel:
        typeof req.body.benefitReadMoreLabel === 'string'
          ? req.body.benefitReadMoreLabel.trim()
          : 'Read more →',
      mainServicesTitle:
        typeof req.body.mainServicesTitle === 'string' ? req.body.mainServicesTitle.trim() : 'Main Services',
      brochuresTitle: typeof req.body.brochuresTitle === 'string' ? req.body.brochuresTitle.trim() : 'Brochures',
      brochuresDescription:
        typeof req.body.brochuresDescription === 'string' ? req.body.brochuresDescription.trim() : '',
      brochuresPrimaryButton:
        typeof req.body.brochuresPrimaryButton === 'string'
          ? req.body.brochuresPrimaryButton.trim()
          : 'Download',
      brochuresOrLabel: typeof req.body.brochuresOrLabel === 'string' ? req.body.brochuresOrLabel.trim() : 'OR',
      brochuresSecondaryButton:
        typeof req.body.brochuresSecondaryButton === 'string'
          ? req.body.brochuresSecondaryButton.trim()
          : 'Discover',
      followUsTitle:
        typeof req.body.followUsTitle === 'string' ? req.body.followUsTitle.trim() : 'Follow Us',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'event-processing-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          socials: defaultPage.socials,
          checklist: defaultPage.checklist,
          benefits: defaultPage.benefits,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'event-processing-page' })
    return res.json({
      message: 'Event processing page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update event processing page content' })
  }
})

app.post('/api/event-processing-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = eventProcessingSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateEventProcessingArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getEventProcessingPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'event-processing-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create event processing section item' })
  }
})

app.patch('/api/event-processing-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = eventProcessingSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateEventProcessingArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getEventProcessingPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'event-processing-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update event processing section item' })
  }
})

app.delete('/api/event-processing-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = eventProcessingSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getEventProcessingPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'event-processing-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete event processing section item' })
  }
})

app.get('/api/content-management-page', async (_req, res) => {
  try {
    const page = await getContentManagementPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch content management page data' })
  }
})

app.put('/api/content-management-page', async (req, res) => {
  try {
    const defaultPage = getDefaultContentManagementPage()
    const payload = {
      heroImage: typeof req.body.heroImage === 'string' ? req.body.heroImage.trim() : '',
      mainImage: typeof req.body.mainImage === 'string' ? req.body.mainImage.trim() : '',
      heroTitle:
        typeof req.body.heroTitle === 'string' ? req.body.heroTitle.trim() : 'Content Management',
      sectionTitle:
        typeof req.body.sectionTitle === 'string' ? req.body.sectionTitle.trim() : 'Content Management',
      sectionDescription:
        typeof req.body.sectionDescription === 'string' ? req.body.sectionDescription.trim() : '',
      sectionSecondaryDescription:
        typeof req.body.sectionSecondaryDescription === 'string'
          ? req.body.sectionSecondaryDescription.trim()
          : '',
      benefitsSectionTitle:
        typeof req.body.benefitsSectionTitle === 'string'
          ? req.body.benefitsSectionTitle.trim()
          : 'Our work benefits',
      benefitsSectionDescription:
        typeof req.body.benefitsSectionDescription === 'string'
          ? req.body.benefitsSectionDescription.trim()
          : '',
      mainServicesTitle:
        typeof req.body.mainServicesTitle === 'string' ? req.body.mainServicesTitle.trim() : 'Main Services',
      brochuresTitle: typeof req.body.brochuresTitle === 'string' ? req.body.brochuresTitle.trim() : 'Brochures',
      brochuresDescription:
        typeof req.body.brochuresDescription === 'string' ? req.body.brochuresDescription.trim() : '',
      brochuresPrimaryButton:
        typeof req.body.brochuresPrimaryButton === 'string'
          ? req.body.brochuresPrimaryButton.trim()
          : 'Download',
      brochuresOrLabel: typeof req.body.brochuresOrLabel === 'string' ? req.body.brochuresOrLabel.trim() : 'OR',
      brochuresSecondaryButton:
        typeof req.body.brochuresSecondaryButton === 'string'
          ? req.body.brochuresSecondaryButton.trim()
          : 'Discover',
      followUsTitle:
        typeof req.body.followUsTitle === 'string' ? req.body.followUsTitle.trim() : 'Follow Us',
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'content-management-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaultPage.key,
          serviceLinks: defaultPage.serviceLinks,
          socials: defaultPage.socials,
          gallery: defaultPage.gallery,
          checklist: defaultPage.checklist,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'content-management-page' })
    return res.json({
      message: 'Content management page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update content management page content' })
  }
})

app.post('/api/content-management-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = contentManagementSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateContentManagementArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getContentManagementPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'content-management-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create content management section item' })
  }
})

app.patch('/api/content-management-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = contentManagementSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateContentManagementArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getContentManagementPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'content-management-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update content management section item' })
  }
})

app.delete('/api/content-management-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = contentManagementSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getContentManagementPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'content-management-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete content management section item' })
  }
})

app.get('/api/privacy-policy-page', async (_req, res) => {
  try {
    const page = await getPrivacyPolicyPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch privacy policy page data' })
  }
})

app.put('/api/privacy-policy-page', async (req, res) => {
  try {
    const page = await getPrivacyPolicyPageDocument()
    const defaults = getDefaultPrivacyPolicyPage()
    const payload = { updatedAt: new Date() }

    if (typeof req.body.heroImage === 'string') payload.heroImage = req.body.heroImage.trim()
    if (typeof req.body.pageTitle === 'string') payload.pageTitle = req.body.pageTitle.trim()

    if (req.body.asidePrivacyFirst && typeof req.body.asidePrivacyFirst === 'object') {
      const cur = page.asidePrivacyFirst || defaults.asidePrivacyFirst
      const n = req.body.asidePrivacyFirst
      payload.asidePrivacyFirst = {
        label: typeof n.label === 'string' ? n.label.trim() : cur.label,
        title: typeof n.title === 'string' ? n.title.trim() : cur.title,
        description: typeof n.description === 'string' ? n.description.trim() : cur.description,
      }
    }

    if (req.body.asideHighlights && typeof req.body.asideHighlights === 'object') {
      const cur = page.asideHighlights || defaults.asideHighlights
      const n = req.body.asideHighlights
      payload.asideHighlights = {
        label: typeof n.label === 'string' ? n.label.trim() : cur.label,
        items: Array.isArray(cur.items) ? cur.items : [],
      }
    }

    if (req.body.asideNeedHelp && typeof req.body.asideNeedHelp === 'object') {
      const cur = page.asideNeedHelp || defaults.asideNeedHelp
      const n = req.body.asideNeedHelp
      payload.asideNeedHelp = {
        label: typeof n.label === 'string' ? n.label.trim() : cur.label,
        description: typeof n.description === 'string' ? n.description.trim() : cur.description,
      }
    }

    // Document is guaranteed to exist — getPrivacyPolicyPageDocument() inserts defaults if missing.
    // Do not mix $set with $setOnInsert using the same paths as ...defaults (MongoDB upsert path conflict).
    const updateResult = await getPageContentCollection().updateOne({ key: 'privacy-policy-page' }, { $set: payload })

    if (!updateResult.matchedCount) {
      return res.status(500).json({ error: 'Privacy policy document not found after load' })
    }

    const updatedPage = await getPageContentCollection().findOne({ key: 'privacy-policy-page' })
    return res.json({
      message: 'Privacy policy page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update privacy policy page content' })
  }
})

app.post('/api/privacy-policy-page/sections', async (req, res) => {
  try {
    const { errors, value } = validatePrivacyPolicySectionPayload(req.body, { partial: false })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const newSection = {
      _id: new ObjectId().toString(),
      ...value,
    }

    const page = await getPrivacyPolicyPageDocument()
    const nextSections = [...(page.sections || []), newSection]

    await getPageContentCollection().updateOne(
      { key: 'privacy-policy-page' },
      {
        $set: {
          sections: nextSections,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: 'Privacy policy section created successfully',
      section: newSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create privacy policy section' })
  }
})

app.patch('/api/privacy-policy-page/sections/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params
    const { errors, value } = validatePrivacyPolicySectionPayload(req.body, { partial: true })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getPrivacyPolicyPageDocument()
    const sections = page.sections || []
    const index = sections.findIndex((s) => s._id === sectionId)

    if (index === -1) {
      return res.status(404).json({ error: 'Section not found' })
    }

    const prev = sections[index]
    const updated = { ...prev }

    if ('title' in value) updated.title = value.title
    if ('paragraphs' in value) updated.paragraphs = value.paragraphs
    if ('bullets' in value) {
      if (value.bullets === null) delete updated.bullets
      else updated.bullets = value.bullets
    }
    if ('footer' in value) {
      if (value.footer === null || value.footer === '') delete updated.footer
      else updated.footer = value.footer
    }

    const nextSections = [...sections]
    nextSections[index] = updated

    await getPageContentCollection().updateOne(
      { key: 'privacy-policy-page' },
      {
        $set: {
          sections: nextSections,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: 'Privacy policy section updated successfully',
      section: updated,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update privacy policy section' })
  }
})

app.delete('/api/privacy-policy-page/sections/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params
    const page = await getPrivacyPolicyPageDocument()
    const sections = page.sections || []
    const nextSections = sections.filter((s) => s._id !== sectionId)

    if (nextSections.length === sections.length) {
      return res.status(404).json({ error: 'Section not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'privacy-policy-page' },
      {
        $set: {
          sections: nextSections,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: 'Privacy policy section deleted successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete privacy policy section' })
  }
})

app.post('/api/privacy-policy-page/highlight-items', async (req, res) => {
  try {
    const { errors, value } = validatePrivacyPolicyHighlightPayload(req.body, { partial: false })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const newItem = {
      _id: new ObjectId().toString(),
      ...value,
    }

    const page = await getPrivacyPolicyPageDocument()
    const defaults = getDefaultPrivacyPolicyPage()
    const aside = page.asideHighlights || defaults.asideHighlights
    const items = [...(aside.items || []), newItem]

    await getPageContentCollection().updateOne(
      { key: 'privacy-policy-page' },
      {
        $set: {
          asideHighlights: { ...aside, items },
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: 'Highlight item created successfully',
      item: newItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create privacy policy highlight item' })
  }
})

app.patch('/api/privacy-policy-page/highlight-items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    const { errors, value } = validatePrivacyPolicyHighlightPayload(req.body, { partial: true })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getPrivacyPolicyPageDocument()
    const defaults = getDefaultPrivacyPolicyPage()
    const aside = page.asideHighlights || defaults.asideHighlights
    const list = aside.items || []
    const index = list.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Highlight item not found' })
    }

    const updatedItem = { ...list[index], ...value }
    const nextItems = [...list]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'privacy-policy-page' },
      {
        $set: {
          asideHighlights: { ...aside, items: nextItems },
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: 'Highlight item updated successfully',
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update privacy policy highlight item' })
  }
})

app.delete('/api/privacy-policy-page/highlight-items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    const page = await getPrivacyPolicyPageDocument()
    const defaults = getDefaultPrivacyPolicyPage()
    const aside = page.asideHighlights || defaults.asideHighlights
    const list = aside.items || []
    const nextItems = list.filter((item) => item._id !== itemId)

    if (nextItems.length === list.length) {
      return res.status(404).json({ error: 'Highlight item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'privacy-policy-page' },
      {
        $set: {
          asideHighlights: { ...aside, items: nextItems },
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: 'Highlight item deleted successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete privacy policy highlight item' })
  }
})

function pickAboutPageScalar(body, existing, key) {
  if (!(key in body)) return existing[key]
  const v = body[key]
  if (typeof v === 'string') return v.trim()
  if (v == null) return ''
  return String(v).trim()
}

app.get('/api/about-page', async (_req, res) => {
  try {
    const page = await getAboutPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch about page data' })
  }
})

app.put('/api/about-page', async (req, res) => {
  try {
    const existing = await getAboutPageDocument()
    const defaults = getDefaultAboutPage()
    const payload = {
      heroImage: pickAboutPageScalar(req.body, existing, 'heroImage') || defaults.heroImage,
      workProcessEyebrow:
        pickAboutPageScalar(req.body, existing, 'workProcessEyebrow') || defaults.workProcessEyebrow,
      workProcessTitle:
        pickAboutPageScalar(req.body, existing, 'workProcessTitle') || defaults.workProcessTitle,
      whyChooseUsImage:
        pickAboutPageScalar(req.body, existing, 'whyChooseUsImage') || defaults.whyChooseUsImage,
      whyChooseUsEyebrow:
        pickAboutPageScalar(req.body, existing, 'whyChooseUsEyebrow') || defaults.whyChooseUsEyebrow,
      whyChooseUsTitle:
        pickAboutPageScalar(req.body, existing, 'whyChooseUsTitle') || defaults.whyChooseUsTitle,
      whyChooseUsDescription: pickAboutPageScalar(req.body, existing, 'whyChooseUsDescription'),
      aboutEyebrow: pickAboutPageScalar(req.body, existing, 'aboutEyebrow') || defaults.aboutEyebrow,
      aboutTitle: pickAboutPageScalar(req.body, existing, 'aboutTitle') || defaults.aboutTitle,
      missionTitle: pickAboutPageScalar(req.body, existing, 'missionTitle') || defaults.missionTitle,
      missionText: pickAboutPageScalar(req.body, existing, 'missionText'),
      visionTitle: pickAboutPageScalar(req.body, existing, 'visionTitle') || defaults.visionTitle,
      visionText: pickAboutPageScalar(req.body, existing, 'visionText'),
      aboutMainImage:
        pickAboutPageScalar(req.body, existing, 'aboutMainImage') || defaults.aboutMainImage,
      aboutOverlayImage:
        pickAboutPageScalar(req.body, existing, 'aboutOverlayImage') || defaults.aboutOverlayImage,
      teamEyebrow: pickAboutPageScalar(req.body, existing, 'teamEyebrow') || defaults.teamEyebrow,
      teamTitle: pickAboutPageScalar(req.body, existing, 'teamTitle') || defaults.teamTitle,
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'about-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaults.key,
          processSteps: defaults.processSteps,
          whyChooseUsServices: defaults.whyChooseUsServices,
          reviews: defaults.reviews,
          stats: defaults.stats,
          team: defaults.team,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'about-page' })
    return res.json({
      message: 'About page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update about page content' })
  }
})

app.post('/api/about-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = aboutPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateAboutPageArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getAboutPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'about-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create about page section item' })
  }
})

app.patch('/api/about-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = aboutPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateAboutPageArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getAboutPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'about-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update about page section item' })
  }
})

app.delete('/api/about-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = aboutPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getAboutPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'about-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete about page section item' })
  }
})

function pickHowWeWorkPageScalar(body, existing, key) {
  if (!(key in body)) return existing[key]
  const v = body[key]
  if (typeof v === 'string') return v.trim()
  if (v == null) return ''
  return String(v).trim()
}

app.get('/api/how-we-work-page', async (_req, res) => {
  try {
    const page = await getHowWeWorkPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch how we work page data' })
  }
})

app.put('/api/how-we-work-page', async (req, res) => {
  try {
    const existing = await getHowWeWorkPageDocument()
    const defaults = getDefaultHowWeWorkPage()
    const payload = {
      heroImage: pickHowWeWorkPageScalar(req.body, existing, 'heroImage') || defaults.heroImage,
      historyEyebrow:
        pickHowWeWorkPageScalar(req.body, existing, 'historyEyebrow') || defaults.historyEyebrow,
      historyTitle: pickHowWeWorkPageScalar(req.body, existing, 'historyTitle') || defaults.historyTitle,
      pricingEyebrow:
        pickHowWeWorkPageScalar(req.body, existing, 'pricingEyebrow') || defaults.pricingEyebrow,
      pricingTitle: pickHowWeWorkPageScalar(req.body, existing, 'pricingTitle') || defaults.pricingTitle,
      planButtonLabel:
        pickHowWeWorkPageScalar(req.body, existing, 'planButtonLabel') || defaults.planButtonLabel,
      statsBannerImage:
        pickHowWeWorkPageScalar(req.body, existing, 'statsBannerImage') || defaults.statsBannerImage,
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'how-we-work-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaults.key,
          history: defaults.history,
          plans: defaults.plans,
          pricingFeatures: defaults.pricingFeatures,
          stats: defaults.stats,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'how-we-work-page' })
    return res.json({
      message: 'How we work page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update how we work page content' })
  }
})

app.post('/api/how-we-work-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = howWeWorkPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateHowWeWorkArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getHowWeWorkPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'how-we-work-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create how we work section item' })
  }
})

app.patch('/api/how-we-work-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = howWeWorkPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateHowWeWorkArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getHowWeWorkPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'how-we-work-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update how we work section item' })
  }
})

app.delete('/api/how-we-work-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = howWeWorkPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getHowWeWorkPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'how-we-work-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete how we work section item' })
  }
})

function pickFaqPageScalar(body, existing, key) {
  if (!(key in body)) return existing[key]
  const v = body[key]
  if (typeof v === 'string') return v.trim()
  if (v == null) return ''
  return String(v).trim()
}

app.get('/api/faq-page', async (_req, res) => {
  try {
    const page = await getFaqPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch FAQ page data' })
  }
})

app.put('/api/faq-page', async (req, res) => {
  try {
    const existing = await getFaqPageDocument()
    const defaults = getDefaultFaqPage()
    const payload = {
      heroImage: pickFaqPageScalar(req.body, existing, 'heroImage') || defaults.heroImage,
      sidebarEyebrow:
        pickFaqPageScalar(req.body, existing, 'sidebarEyebrow') || defaults.sidebarEyebrow,
      sidebarTitle: pickFaqPageScalar(req.body, existing, 'sidebarTitle') || defaults.sidebarTitle,
      sidebarDescription: pickFaqPageScalar(req.body, existing, 'sidebarDescription'),
      contactCardTitle:
        pickFaqPageScalar(req.body, existing, 'contactCardTitle') || defaults.contactCardTitle,
      contactCardBody: pickFaqPageScalar(req.body, existing, 'contactCardBody'),
      updatedAt: new Date(),
    }

    await getPageContentCollection().updateOne(
      { key: 'faq-page' },
      {
        $set: payload,
        $setOnInsert: {
          key: defaults.key,
          faqItems: defaults.faqItems,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'faq-page' })
    return res.json({
      message: 'FAQ page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update FAQ page content' })
  }
})

app.post('/api/faq-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = faqPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateFaqPageArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getFaqPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'faq-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create FAQ section item' })
  }
})

app.patch('/api/faq-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = faqPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateFaqPageArrayItem(targetSection, req.body, {
      partial: true,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getFaqPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const updatedItem = {
      ...items[index],
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'faq-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update FAQ section item' })
  }
})

app.delete('/api/faq-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = faqPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getFaqPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'faq-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete FAQ section item' })
  }
})

function pickOurTeamPageScalar(body, existing, key) {
  if (!(key in body)) return existing[key]
  const v = body[key]
  if (typeof v === 'string') return v.trim()
  if (v == null) return ''
  return String(v).trim()
}

app.get('/api/our-team-page', async (_req, res) => {
  try {
    const page = await getOurTeamPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch our team page data' })
  }
})

app.put('/api/our-team-page', async (req, res) => {
  try {
    const existing = await getOurTeamPageDocument()
    const defaults = getDefaultOurTeamPage()
    const heroImage =
      pickOurTeamPageScalar(req.body, existing, 'heroImage') || defaults.heroImage

    await getPageContentCollection().updateOne(
      { key: 'our-team-page' },
      {
        $set: {
          heroImage,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          key: defaults.key,
          teamMembers: defaults.teamMembers,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'our-team-page' })
    return res.json({
      message: 'Our team page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update our team page content' })
  }
})

app.post('/api/our-team-page/:section', async (req, res) => {
  try {
    const { section } = req.params
    const targetSection = ourTeamPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const { errors, value } = validateOurTeamPageArrayItem(targetSection, req.body)

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getOurTeamPageDocument()
    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextItems = [...(page[targetSection] || []), nextItem]

    await getPageContentCollection().updateOne(
      { key: 'our-team-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: `${targetSection} item created successfully`,
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create our team section item' })
  }
})

app.patch('/api/our-team-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = ourTeamPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getOurTeamPageDocument()
    const items = page[targetSection] || []
    const index = items.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const existingMember = items[index]
    const { errors, value } = validateOurTeamPageArrayItem(targetSection, req.body, {
      partial: true,
      existingMember,
    })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const updatedItem = {
      ...existingMember,
      ...value,
    }

    const nextItems = [...items]
    nextItems[index] = updatedItem

    await getPageContentCollection().updateOne(
      { key: 'our-team-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: `${targetSection} item updated successfully`,
      item: updatedItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update our team section item' })
  }
})

app.delete('/api/our-team-page/:section/:itemId', async (req, res) => {
  try {
    const { section, itemId } = req.params
    const targetSection = ourTeamPageSections[section]

    if (!targetSection) {
      return res.status(400).json({ error: 'Invalid section' })
    }

    const page = await getOurTeamPageDocument()
    const items = page[targetSection] || []
    const nextItems = items.filter((item) => item._id !== itemId)

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'our-team-page' },
      {
        $set: {
          [targetSection]: nextItems,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: `${targetSection} item deleted successfully` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete our team section item' })
  }
})

function pickBlogPageScalar(body, existing, key) {
  if (!(key in body)) return existing[key]
  const v = body[key]
  if (typeof v === 'string') return v.trim()
  if (v == null) return ''
  return String(v).trim()
}

app.get('/api/blog-page', async (_req, res) => {
  try {
    const page = await getBlogPageDocument()
    return res.json(normalizeDocument(page))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch blog page data' })
  }
})

app.put('/api/blog-page', async (req, res) => {
  try {
    const existing = await getBlogPageDocument()
    const defaults = getDefaultBlogPage()

    const $set = {
      heroImage: pickBlogPageScalar(req.body, existing, 'heroImage') || defaults.heroImage,
      pageEyebrow: pickBlogPageScalar(req.body, existing, 'pageEyebrow') || defaults.pageEyebrow,
      pageTitle: pickBlogPageScalar(req.body, existing, 'pageTitle') || defaults.pageTitle,
      pageIntro: pickBlogPageScalar(req.body, existing, 'pageIntro') || defaults.pageIntro,
      updatedAt: new Date(),
    }

    if (req.body && 'featuredPost' in req.body && req.body.featuredPost && typeof req.body.featuredPost === 'object') {
      const { errors, value } = validateBlogPostItem(req.body.featuredPost, { partial: false })
      if (errors.length) {
        return res.status(400).json({ error: errors.join(', ') })
      }
      $set.featuredPost = value
    }

    await getPageContentCollection().updateOne(
      { key: 'blog-page' },
      {
        $set: $set,
        $setOnInsert: {
          key: defaults.key,
          posts: defaults.posts,
          featuredPost: defaults.featuredPost,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const updatedPage = await getPageContentCollection().findOne({ key: 'blog-page' })
    return res.json({
      message: 'Blog page content updated',
      page: normalizeDocument(updatedPage),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update blog page content' })
  }
})

app.post('/api/blog-page/posts', async (req, res) => {
  try {
    const { errors, value } = validateBlogPostItem(req.body, { partial: false })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const page = await getBlogPageDocument()
    const posts = page[blogPageSections.posts] || []
    if (posts.some((p) => p.slug === value.slug)) {
      return res.status(400).json({ error: 'A post with this slug already exists' })
    }
    if (page.featuredPost?.slug === value.slug) {
      return res.status(400).json({ error: 'Slug is already used by the featured article' })
    }

    const nextItem = {
      _id: new ObjectId().toString(),
      ...value,
    }
    const nextPosts = [...posts, nextItem]

    await getPageContentCollection().updateOne(
      { key: 'blog-page' },
      {
        $set: {
          [blogPageSections.posts]: nextPosts,
          updatedAt: new Date(),
        },
      },
    )

    return res.status(201).json({
      message: 'Blog post created successfully',
      item: nextItem,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create blog post' })
  }
})

app.patch('/api/blog-page/posts/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    const { errors, value } = validateBlogPostItem(req.body, { partial: true })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(value).length) {
      return res.status(400).json({ error: 'At least one field is required to update' })
    }

    const page = await getBlogPageDocument()
    const posts = page[blogPageSections.posts] || []
    const index = posts.findIndex((item) => item._id === itemId)

    if (index === -1) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const existingItem = posts[index]
    const merged = { ...existingItem, ...value }
    if (value.slug && posts.some((p, i) => i !== index && p.slug === value.slug)) {
      return res.status(400).json({ error: 'Another post already uses this slug' })
    }
    if (merged.slug && page.featuredPost?.slug === merged.slug) {
      return res.status(400).json({ error: 'Slug is already used by the featured article' })
    }

    const nextPosts = [...posts]
    nextPosts[index] = merged

    await getPageContentCollection().updateOne(
      { key: 'blog-page' },
      {
        $set: {
          [blogPageSections.posts]: nextPosts,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({
      message: 'Blog post updated successfully',
      item: merged,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update blog post' })
  }
})

app.delete('/api/blog-page/posts/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    const page = await getBlogPageDocument()
    const posts = page[blogPageSections.posts] || []
    const nextPosts = posts.filter((item) => item._id !== itemId)

    if (nextPosts.length === posts.length) {
      return res.status(404).json({ error: 'Post not found' })
    }

    await getPageContentCollection().updateOne(
      { key: 'blog-page' },
      {
        $set: {
          [blogPageSections.posts]: nextPosts,
          updatedAt: new Date(),
        },
      },
    )

    return res.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete blog post' })
  }
})

async function shutdown(signal) {
  console.log(`\n${signal} received, closing…`)
  await closeMongo().catch(() => {})
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

async function start() {
  if (MONGODB_URI) {
    await connectMongo(MONGODB_URI)
  } else {
    console.warn('[warn] MONGODB_URI is not set — add it to .env')
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
