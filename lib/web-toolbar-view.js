'use babel';

const express = require('express')
const portfinder = require('portfinder');
const http = require('http');
const readdirp = require('readdirp');

export default class WebToolbarView {

  constructor(serializedState) {

    this.app = express()
    this.server;
    this.port;

    //serverStatus of the server if off = false, on = true
    this.serverStatus = false;

    this.localPath =  atom.packages.resolvePackagePath("web-toolbar")

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('web-toolbar');
    const toolbar = this.element

    //server button
    this.button = document.createElement('a');
    this.button.classList.add('button');
    this.button.appendChild( document.createTextNode("Start Server") );
    this.button.title = "Start Server";
    this.button.href = "#";
    toolbar.appendChild(this.button);


    this.button.addEventListener("click", (e) => {
      if(this.serverStatus == true){ //stop server
        // console.log("stop server")
        this.stopServer()
      }else{ //start server
        // console.log("start server")
        if(atom.project.getPaths()[1]){
          atom.notifications.addError('You might have more than one web project open? Open a single project and try again.');
        }else{
          this.startServer()
        }
      }
    });


    //create helpful links
    function createLink(title, link){
      var c = document.createElement('a');
      c.appendChild( document.createTextNode(title) );
      c.title = title;
      c.href = link;
      toolbar.appendChild(c);
    }

    createLink("HTML Element Reference", "https://developer.mozilla.org/en-US/docs/Web/HTML/Element");
    createLink("CSS Reference", "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference")

    createLink("MDN|HTML", "https://developer.mozilla.org/en-US/docs/Web/HTML");
    createLink("MDN|CSS", "https://developer.mozilla.org/en-US/docs/Web/CSS");

  } //end constructor

  startServer(pathtoINDEX){
    console.log("***RUN THE SERVER***")
    readdirp({ root: atom.project.getPaths()[0], fileFilter: 'index.html' }) //search out 0th project path for index.html
      .on('data', (entry) => {
        // console.log(atom.project.getPaths())
        //fs.existsSync(atom.project.getPaths()[0] + "/index.html")
        // console.log(entry)
        // console.log(entry.path)
        // if( entry.path ){ //check to see if the index.html exists.
        if(this.serverStatus == false){ //prevent spawning  multiple server instances in the case of multiple index.js files in sub directories
          this.serverStatus = true
          // console.log(atom.project.getPaths()[0])
          this.app.use(express.static(atom.project.getPaths()[0] )) // server out static files
          portfinder.getPort((err, port) => { //get port
            if(err){ atom.notifications.addError(err); return;}
            this.port = port
            this.server = this.app.listen(port, () => { //start server & store it
              console.log('webtoolbar server started on: ' + port)
              atom.notifications.addSuccess('web-toolbar started a server to run your project at http://localhost:' + port + "/" + entry.path)
              this.button.innerHTML = "Stop Server"
              this.button.style["text-decoration"] = "none"
              shell.openExternal('http://localhost:' + port + "/" + entry.path) //open browser
            });
          });
        }
      }).on('end', ()=>{
        //we can assume no file found, throw error
        if(this.serverStatus == false){
            console.error('no index file found')
            atom.notifications.addError('No index.html file found, are you sure you have a valid web project open?');
        }

      })
  }

  stopServer(){
    console.log("***STOP THE SERVER***")
    this.serverStatus = false
    this.button.innerHTML = "Start Server"
    // console.log(this.server)
    if(this.server){
      atom.notifications.addWarning('web-toolbar closed the server running your project at http://localhost:' + this.port)
      this.server.close()
    }
  }


  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    //kill the server too!
    this.stopServer()
  }

  getElement() {
    return this.element;
  }

}
