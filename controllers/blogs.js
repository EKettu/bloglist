const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
        .populate('user', { username: 1, name: 1 })
    response.json(blogs.map(Blog.format))
})

blogsRouter.post('/', async (request, response) => {
    try {
        const body = request.body
        const token = request.token
        const decodedToken = jwt.verify(token, process.env.SECRET)

        if (!token || !decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }

        if (body.title === undefined && body.url === undefined) {
            return response.status(400).json({ error: 'title missing' })
        }
        // const users = await User.find({})
        // const user= users[0]
        const user = await User.findById(decodedToken.id)

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes || 0,
            user: user._id
        })
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        response.json(Blog.format(savedBlog))
    } catch (exception) {
        if (exception.name === 'JsonWebTokenError') {
            response.status(401).json({ error: exception.message })
        } else {
            console.log(exception)
            response.status(500).json({ error: 'something went wrong...' })
        }
    }

})

blogsRouter.delete('/:id', async (request, response) => {
    try {
        const token = request.token
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const user = await User.findById(decodedToken.id)
        const blog = await Blog.findById(request.params.id)
        const blogsUser = await User.findById(blog.user)

        if (blogsUser.toString() !== user.toString()) {
            return response.status(401).json({ error: 'delete operation forbidden' })
        }
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } catch (exception) {
        console.log(exception)
        response.status(400).send({ error: 'malformatted id' })
    }
})

blogsRouter.put('/:id', async (request, response) => {
    try {
        const { title, author, url, likes } = request.body
        const blog = {
            title,
            author,
            url,
            likes
        }
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog)
        response.json(Blog.format(updatedBlog))

    } catch (exception) {
        console.log(exception)
        response.status(400).send({ error: 'malformatted id' })
    }
})

module.exports = blogsRouter