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
