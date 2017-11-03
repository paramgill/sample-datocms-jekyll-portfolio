require('babel-polyfill');
require('dotenv').config();

const fetch = require('node-fetch');
//const jsonfile = require('jsonfile');
const schedule = require('node-schedule');
const toMarkdown = require('to-markdown');

//Dato Config
var datoCmsKey = process.env.DATOCMS3794;
const SiteClient = require('datocms-client').SiteClient;
const client = new SiteClient(datoCmsKey);

var file = './tmp/data.json';
var whatsonid = "";
var title = "";
var slug = "";
var description = "";
var excerpt = "";
var image = "";

//var j = schedule.scheduleJob('* * * * *', function () {
fetch('https://whatson.cityofsydney.nsw.gov.au/api/v1/search/advanced?programs=art-and-about-sydney&date[]=2014-01-01&date[]=2017-12-31')
    .then(function (res) {
        return res.json();
    }).then(function (json) {

        data = json.data;

        //findRecord(125995);
        //showRecords();
        //createItemsFromAPI(data);
        awaitTest(data);
        //client.items.update(itemId, resourceAttributes)

    }).catch(function (err) {
        console.log(err);
    });
//});

// To retrieve records of a specific model
function showRecords() {
    client.items.all({
            'filter[type]': 'work'
        })
        .then(
            (records) => console.log(records)
        ).catch(function (err) {
            console.log(err);
        });
}

// Return a specific item
function findRecord(itemId) {
    //client.items.find(itemId).then((item) => console.log(item.whatsonid));
    client.items.find(itemId).then((item) => {
        if ((item)) {
            console.log('True - Item exists');
            return true;
        }
    }).catch(function (err) {
        console.log('False - Item does not exist');
        return false;
    });
}

function createItemsFromAPI(data) {
    for (var i in data) {

        id = data[i].id;
        title = data[i].title;
        slug = data[i].slug;
        description = toMarkdown(data[i].content);
        excerpt = data[i].excerpt;

        // Create a new record
        client.items.create({
            itemType: '16858',
            whatsonid: id,
            title: title,
            slug: slug,
            description: description,
            excerpt: excerpt
        });
    }
}

function awaitTest(data) {
    (async() => {

        for (var i in data) {

            //console.log(data);

            id = data[i].id;
            title = data[i].title;
            slug = data[i].slug;
            description = toMarkdown(data[i].content);
            excerpt = data[i].excerpt;
            image = data[1].thumbnails.event_major.src

            // Create a new record
            // create a new Article
            await client.items.create({
                itemType: '16858',
                whatsonid: id,
                title: title,
                slug: slug,
                description: description,
                excerpt: excerpt,
                cover_image: (await client.uploadImage(image))
            }).then((record) => console.log(record));
        }
    })();
}