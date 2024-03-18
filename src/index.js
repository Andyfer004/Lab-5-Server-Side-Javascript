import express from 'express';
import {getAllPosts} from './db.js';

const app = express();

app.get('/' , async (req , res) => {

    const posts = await getAllPosts();
    console.log('all posts', posts);
    res.json(posts);
});

app.listen(8080 , () => {
    console.log('Server is running on port 8080');
});   