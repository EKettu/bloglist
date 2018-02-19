const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item.likes
    }
    return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const reducer = (initial, blog) => {
        if (initial.likes < blog.likes) {
            initial.blog = blog
            initial.likes = blog.likes
        }
        return initial
    }
    return blogs.length === 0 ? 'no blogs' : blogs.reduce(reducer, { likes: 0, blog: {} }).blog
}

const count = (array, classifier, adder) => {
    classifier = classifier || String
    return array.reduce((counter, blog) => {
        const property = classifier(blog)
        counter[property] = counter.hasOwnProperty(property) ? counter[property] + adder(blog) : adder(blog)
        return counter
    }, {})
}

const mostBlogs = (blogs) => {

    if (blogs.length === 0) {
        return null
    }

    const countByAuthor = count(blogs, (blog) => {
        return blog.author
    }, (blog)=> 1)

    let mostProductive = {
        author: 'joku',
        blogs: 0
    }
    Object.keys(countByAuthor)
        .forEach((key) => {
            if (countByAuthor[key] > mostProductive.blogs) {
                mostProductive.author = key
                mostProductive.blogs = countByAuthor[key]
            }
        })

    return mostProductive
}


const mostLikes = (blogs) => {

    if (blogs.length === 0) {
        return null
    }
    
    const countByAuthor = count(blogs, (blog) => {
        return blog.author
    }, (blog)=> blog.likes)


    let mostLiked = {
        author: 'joku',
        likes: 0
    }
    Object.keys(countByAuthor)
        .forEach((key) => {
            if (countByAuthor[key] > mostLiked.likes) {
                mostLiked.author = key
                mostLiked.likes = countByAuthor[key]
            }
        })

    return mostLiked
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}