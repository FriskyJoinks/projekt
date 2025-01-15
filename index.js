import 'dotenv/config';
import http from 'http';
import { ReturnDocument } from 'mongodb';
import { handleStaticFileRequest } from './static-file-handler.js';
import { getRequestBody } from './ulities.js';

let websiteTitle = "Gustavo Fring Los Pollos Hermanos";
let websitedescription = "Hello welocme to los polls hermanos";

async function handleRequest(request, response) {
    let url = new URL(request.url, 'http://' + request.headers.host);
    let path = url.pathname;
    let pathSegments = path.split('/').filter(function (segment) {
        if (segment === '' || segment === '..') {
            return false;
        } else {
            return true;
        }
    });

    let nextSegment = pathSegments.shift();

if (nextSegment=== 'static'){
    await handleStaticFileRequest(pathSegments, request, response);
    return;
}

    if (nextSegment === 'website') {
        response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF8' });
        response.write(`
        <html>
        <head>
            <title>Home Page</title>

            <link rel="stylesheet" href="/static/style.css">   
        </head>
        <body>
        <h1>` + cleanupHTMLOutput(websiteTitle) + `</h1>
        <p>` + cleanupHTMLOutput(websiteDescription) + `</p>
        </body>
        </html>
        `);
        response.end();
        return;
    }

    if (nextSegment === 'form') {
        response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF8' });
        response.write(`
        <html>
        <head>
            <title>Home Page</title>
        </head>
        <body>
           <form action ="/change-website-info" method="POST">
            <input type="text" name="website-name" placeholder="Wesbites name">
            <textarea name="website-description" placeholder="Beskrivning"></textarea>
            <button type="submit">Submit</button>
           </form>
        </body>
        </html>
        `);
        response.end();
        return;
    }
    if (nextSegment === 'change-website-info') {
        let body = await getRequestBody(request);
        let params = new URLSearchParams(body);

        websiteTitle = params.get('website-name');
        websitedescription = params.get('website-description');

        //response.writeHead(303 , {'Location': '/website'});
        response.writeHead(200, { 'Content-Type': 'text/plain' })
        response.write('200 OK');
        response.end();
        return;
    }

    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.write('404 Not Found');
    response.end();
    return;
}

let server = http.createServer(handleRequest);

server.listen(process.env.PORT);