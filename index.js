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
