const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

describe('adding an user ', async () => {
    beforeAll(async () => {
        await User.remove({})
        const user = new User({ username: 'root', name: 'someone', adult: true, password: 'sekret' })
        await user.save()
    })

    test.only('a valid user can be added ', async () => {

        const newUser = {
            username: "ankka",
            name: "Aku Ankka",
            adult: "true",
            password: "secretPassword"
        }

        const usersBefore = await helper.usersInDb()

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAfter = await helper.usersInDb()
        const names = usersAfter.map(user => user.name)

        expect(usersAfter.length).toBe(usersBefore.length + 1)
        expect(names).toContainEqual(newUser.name)
    })

    test('an invalid user with a too short a password can not be added ', async () => {

        const newUser = {
            username: "hopo",
            name: "Hessu Hopo",
            adult: "true",
            password: "sec"
        }

        const usersBefore = await helper.usersInDb()

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ error: 'password must be at least three characters long' })
        const usersAfter = await helper.usersInDb()
        const names = usersAfter.map(user => user.name)

        expect(usersAfter.length).toBe(usersBefore.length)
        expect(names).not.toContainEqual(newUser.name)
    })

    test('an invalid user with a same usernane can not be added ', async () => {

        const newUser = {
            username: "root",
            name: "Hessu H",
            adult: "true",
            password: "secretP"
        }

        const usersBefore = await helper.usersInDb()

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ error: 'username must be unique' })
        const usersAfter = await helper.usersInDb()
        const names = usersAfter.map(user => user.name)


        expect(usersAfter.length).toBe(usersBefore.length)
        expect(names).not.toContainEqual(newUser.name)
    })

})

describe('when there is initially some blogs saved', async () => {
    beforeAll(async () => {
        await Blog.remove({})
        console.log('initializing tests')
        const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
        const promiseArray = blogObjects.map(blog => blog.save())
        await Promise.all(promiseArray)
    })

    test('blogs are returned as json', async () => {
        const blogsInDatabase = await helper.blogsInDb()
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).toBe(blogsInDatabase.length)
        const returnedContents = response.body.map(blog => blog.title)
        blogsInDatabase.forEach(blog => {
            expect(returnedContents).toContain(blog.title)
        });
    })

})

describe('addition of a new blog', async () => {
    //4.9
    test.only('a valid blog can be added ', async () => {
        const newBlog = {
            title: "NewBlog",
            author: "John Smith",
            url: "newblog.com",
            likes: 2
        }

        const blogsBefore = await helper.blogsInDb()

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const blogsAfter = await helper.blogsInDb()
        const titles = blogsAfter.map(blog => blog.title)

        expect(blogsAfter.length).toBe(blogsBefore.length + 1)
        expect(titles).toContainEqual(newBlog.title)
    })

    //4.10
    test('a valid blog without likes can be added ', async () => {
        const newBlog2 = {
            title: "NewBlogWithoutLikes",
            author: "Jaska Jokunen",
            url: "newbloglikes.com"
        }

        const blogsBefore = await helper.blogsInDb()

        const addedBlog = await api
            .post('/api/blogs')
            .send(newBlog2)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const blogsAfter = await helper.blogsInDb()
        const titles = blogsAfter.map(blog => blog.title)

        expect(addedBlog.body.likes).toBe(0)
        expect(blogsAfter.length).toBe(blogsBefore.length + 1)
        expect(titles).toContain('NewBlogWithoutLikes')
    })

    //4.11
    test('an invalid blog cannot be added ', async () => {
        const newInvalidBlog = {
            author: "Stupid blogger",
            likes: 2
        }

        const blogsBefore = await helper.blogsInDb()

        await api
            .post('/api/blogs')
            .send(newInvalidBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const blogsAfter = await helper.blogsInDb()
        const authors = blogsAfter.map(blog => blog.author)

        expect(blogsBefore.length).toBe(blogsAfter.length)
        expect(authors).not.toContain('Stupid blogger')
    })

})

//4.13
describe('deletion of a blog', async () => {
    let addedBlog

    beforeAll(async () => {
        addedBlog = new Blog({
            title: "A blog to be deleted",
            author: "Nobody",
            url: "deletedblog.com",
            likes: 1
        })
        await addedBlog.save()
    })

    test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
        const blogsAtStart = await helper.blogsInDb()

        await api
            .delete(`/api/blogs/${addedBlog._id}`)
            .expect(204)

        const blogsAfterOperation = await helper.blogsInDb()

        const titles = blogsAfterOperation.map(blog => blog.title)

        expect(titles).not.toContain(addedBlog.title)
        expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
    })

})

//4.14
describe('updating a blog', async () => {

    test('PUT /api/blogs/:id succeeds with proper statuscode', async () => {
        const blogsInDatabase = await helper.blogsInDb()
        const blogToUpdate = blogsInDatabase[0]

        const updatedBlog = {
            title: blogToUpdate.title,
            author: blogToUpdate.author,
            url: blogToUpdate.url,
            likes: blogToUpdate.likes + 1
        }
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const blogsAfterOperation = await helper.blogsInDb()
        const titles = blogsAfterOperation.map(blog => blog.title)

        expect(titles).toContain(updatedBlog.title)
        expect(blogsAfterOperation[0].likes).toBe(blogToUpdate.likes + 1)
    })


    afterAll(() => {
        console.log('closing tests')
        server.close()
    })

})


