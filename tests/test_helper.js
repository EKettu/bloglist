const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: "MyBlog",
    author: "Jane Doe",
    url: "secretblog.com",
    likes: 3
  },
  {
    title: "MyAnotherBlog",
    author: "Edgar Allan Poe",
    url: "mysteryblog.com",
    likes: 5
  }
]

const format = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    id: blog._id

  }
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(format)
}

const usersInDb = async () => {
  const users = await User.find({})
  return users
}

module.exports = {
  initialBlogs, format, blogsInDb, usersInDb
}