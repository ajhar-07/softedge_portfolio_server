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
