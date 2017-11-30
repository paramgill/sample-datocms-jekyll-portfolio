require('babel-polyfill');
require('dotenv').config();
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const fetch = require('node-fetch');
const schedule = require('node-schedule');
const toMarkdown = require('to-markdown');

//Dato Config
var datoCmsKey = process.env.DATOCMS3794;
const SiteClient = require('datocms-client').SiteClient;
const client = new SiteClient(datoCmsKey);

//client.items.all()
//.then((models) => console.log(models));

var file = './tmp/data.json';
var whatson_id = "";
var title = "";
var slug = "";
var description = "";
var excerpt = "";
var image = "";
var projectType = 18000;
fetch('https://whatson.cityofsydney.nsw.gov.au/api/v1/search/advanced?programs=art-and-about-sydney&date[]=2014-01-01&date[]=2017-12-31&include_expired=true&per_page=100')
    .then(function (res) {
        return res.json();
    }).then(function (json) {

        data = json.data;
        //deleteItemsFromAPI();     //delete all the events and related contents from Datocms
        createItemsFromAPI(data);

    }).catch(function (err) {
        console.log(err);
    });


// To retrieve records of a specific model
function showRecords() {
    client.items.all({
        'filter[type]': projectType
    })
        .then(
        (records) => console.log(records)
        ).catch(function (err) {
            console.log(err);
        });
}

// Return a specific item
function findRecord(itemId) {
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

//update records in dato

function createItemsFromAPI(data) {
    var ItemIds = [];
    client.items.all({ 'filter[type]': projectType })                   
        .then((records) => {
            var cnt = 0;
            for (var item in records) {
                ItemIds.push(records[cnt].whatsonId);
                cnt++;
            };
            (async(function testingAsyncAwait() {
                //fethc all the items from datcms
                for (var i in data) {
                    id = data[i].id;
                    if (ItemIds.includes(id)) {     //i
                        console.log("Event ID " + id + " is already there in datocms");
                    } else {
                        title = data[i].title;
                        slug = data[i].slug;
                        eventid = data[i].id;
                        description = toMarkdown(data[i].content);
                        excerpt = data[i].excerpt;
                        coverimage = data[i].thumbnails.thumbnail.src;
                        cover_image = coverimage.replace("-150x150", "");
                        await(
                            client.uploadImage(cover_image)
                                .then(image => {
                                    console.log("Importing Event Id: " + id);
                                    return client.items.create({
                                        itemType: '18000',
                                        whatson_id: eventid,
                                        title: title,
                                        slug: slug,
                                        excerpt: excerpt,
                                        content: description,
                                        image_gallery: image
                                    })
                                }).catch(function (err) {
                                    console.log(err);
                                })
                                .then(record => console.log()).catch(function (err) {
                                    console.log(err);
                                }))
                    }

                }
            }))();
        });

}

//this funtions is used to delete all the projects from datocms
function deleteItemsFromAPI() {

    client.items.all({ 'filter[type]': projectType })
        .then((records) => {
            var cnt = 0;
            for (var item in records) {
                client.items.destroy(records[cnt].id);
                console.log("Deleted : " + records[cnt].id + " WhatsonId : " + records[cnt].whatsonId);
                cnt++;
            };
            console.log("All Deleted");
        });

}

//this funtions add the modular contents, but as it takes time and exits the loop before proeccsing the images so we are not going to use this
//instead we will add excerpt and contents as notmal multiline firlds instead of modular content.


/*

function createItemsFromAPI(data) {
    var ItemIds = [];
    client.items.all({ 'filter[type]': '18000' })
        .then((records) => {
            var cnt = 0;
            for (var item in records) {
                console.log(records);
                ItemIds.push(records[cnt].whatsonId);
                cnt++;
            };
            (async(function testingAsyncAwait() {
                //fethc all the items from datcms
                for (var i in data) {
                    id = data[i].id;
                    console.log(ItemIds);
                    console.log(data[i].id);
                    if (ItemIds.includes(id)) {     //i
                        console.log("event is already there in datocms");

                    } else {
                        title = data[i].title;
                        slug = data[i].slug;
                        eventid = data[i].id;
                        description = toMarkdown(data[i].content);
                        excerpt = data[i].excerpt;
                        coverimage = data[i].thumbnails.thumbnail.src;
                        cover_image = coverimage.replace("-150x150", "");
                        console.log(cover_image);
                        await(
                            client.uploadImage(cover_image)
                                .then((image) => {
                                   client.items.create({
                                        itemType: '17997',
                                        copy: excerpt,
                                    }).then(record => {
                                        excerptid = record.id;
                                         client.items.create({
                                            itemType: '17998',
                                            copy : toMarkdown(data[i].content)
                                        }).then(record => {
                                            contentid = record.id;
                                            console.log("======++"+id+"====="+slug);
                                            
                                            return client.items.create({
                                                itemType: '18000',
                                                whatson_id: eventid,
                                                title: title,
                                                slug: slug,
                                                modularContent: [excerptid,contentid],
                                                image_gallery: image
                                            })
                                        })
                                    })
                                })
                                .then(record => console.log()))
                    }

                }
            }))();
        });

}

*/
