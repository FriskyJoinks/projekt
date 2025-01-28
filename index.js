import 'dotenv/config';
import http from 'http';
import { ReturnDocument } from 'mongodb';
import { handleStaticFileRequest } from './static-file-handler.js';
import { getRequestBody, cleanupHTMLOutput } from './ulities.js';
import fs from 'fs/promises';
import { MongoClient, ObjectId } from 'mongodb';


let dbConn = await MongoClient.connect(process.env.MONGODB_CONNECTION_STRING);

export let dbo = dbConn.db(process.env.MONGODB_DATABASE_NAME);


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

    if (nextSegment === 'main') {
        let template = (await fs.readFile('templates/main.volvo')).toString();
        response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF8' });
        response.write(template);
        response.end();
        return;
    }

   
    if (nextSegment === 'seller') {x
        let template = (await fs.readFile('templates/seller.volvo')).toString();
        response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF8' });
        response.write(template);
        response.end();
        return;
    }
    
    if (nextSegment === 'repurchases') {
        let nextnextSegments = pathSegments.shift();

        if (nextnextSegments) {
            let profileDocument;
            try {
                profileDocument = await dbo.collection('Recent').findOne({ "_id": new ObjectId(nextnextSegments) })
        
            } catch (e) {
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.write('404 Not Found');
                response.end();
                return;
            }
        
            if (!profileDocument) {
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.write('404 Not Found');
                response.end();
                return;
            }
            let template = (await fs.readFile('templates/order.volvo')).toString();
            template = template.replaceAll('%{profileName}%', cleanupHTMLOutput( profileDocument.name))
            template = template.replaceAll('%{profileCountry}%', cleanupHTMLOutput(profileDocument.country))
            template = template.replaceAll('%{profileWeapon}%', cleanupHTMLOutput(profileDocument.weapon))
            template = template.replaceAll('%{profileEmail}%', cleanupHTMLOutput(profileDocument.email))

            response.writeHead(201, { 'Content-Type': 'text/html;charset=UTF-8' });
            response.write(template);
            response.end();
            return;
        }           

        let template = (await fs.readFile('templates/repurchases.volvo')).toString();
        response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF8' });
        response.write(template);
        response.end();
        return;
    }

    
    if (nextSegment === 'handleOrder') {


        let body = await getRequestBody(request);

        let params = new URLSearchParams(body);

        if (!params.get('buyername') || !params.get('buyerlocation')
              || !params.get('weapon') || !params.get('buyeremail')) {

            response.writeHead(400, { 'Content-Type': 'text/plain' });
            response.write('400 Bad Request');
            response.end();
            return;
        }

        let result = await dbo.collection('Recent').insertOne({
            'name': params.get('buyername'),
            'country': params.get('buyerlocation'),
            'weapon': params.get('weapon'),
            'email': params.get('buyeremail')
        });

        response.writeHead(303, { 'Location': '/repurchases/' + result.insertedId });
        response.end();
        return;
    }


    if (nextSegment === 'buyer') {
        let template = (await fs.readFile('templates/buyer.volvo')).toString();
        response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF8' });
        response.write(template);
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