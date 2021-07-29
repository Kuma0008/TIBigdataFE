
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 14001;

const userAuth = require('./module/userAuthQuery');
const keepDoc = require('./module/keepMyDocQuery');
const keywords = require('./module/tfidfQuery');
const topic = require('./module/topicQuery');
const announcement = require('./module/announcementDocsQuery');
const qna = require('./module/qnaDocsQuery');
const faq = require('./module/faqDocsQuery');
const rcmds = require('./module/rcmdQuery');

app.use(cors());
app.use(express.json());
app.use('/users', userAuth);
app.use('/myDoc',keepDoc);
app.use('/keyword',keywords);
app.use('/rcmd', rcmds);
app.use('/announcement',announcement);
app.use('/qna',qna);
app.use('/topic',topic)
app.use('/faq',faq)
app.get('/', function(req, res) {
    res.send('Hello from server');
})


app.listen(PORT, function(){
    console.log('Express server running on port '+ PORT)});

