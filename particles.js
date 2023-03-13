let objOurShow;
const imgImage1 = document.getElementById("idImage1");  
const warpButton = document.getElementById("idWarpButton");

warpButton.addEventListener("click", function(){
    objOurShow.warp();
})
window.addEventListener("load", function(){
    funInitialise();
});

function funInitialise(){
    const objCanvas = document.getElementById("idCanvas");
    objCanvas.width = window.innerWidth;
    objCanvas.height = window.innerHeight;
   
    objOurShow = new clsShow(objCanvas);
    objOurShow.init();
    objOurShow.update()
    objOurShow.draw();
    funAnimationLoop();
}



class clsParticle {
    constructor(position,colour,size){
        this.position = vec2.fromValues(Math.random()*objOurShow.width, Math.random()*objOurShow.height);
        this.origin = vec2.clone(position);
        this.colour = vec3.clone(colour);
        this.size = size;
        this.velocity = vec2.create();
        this.speedMultiplyer = 0.25;
        this.distance = 0;
        this.delta = [];
        this.friction = 1;
        this.force=0;
        this.angle=0;
    }
    draw(){
        // objOurShow.objContext.fillStyle = 'rgb(255,255,255)';
        // objOurShow.objContext.fillRect(this.origin[0], this.origin[1], this.size, this.size);   
        objOurShow.objContext.fillStyle = 'rgb(' + this.colour[0] + ',' + this.colour[1] + ',' + this.colour[2] +')';
        objOurShow.objContext.fillRect(this.position[0], this.position[1], this.size, this.size);   
    }
    update(){
        this.velocity = vec2.fromValues(0,0);
        this.delta = vec2.fsubtract(objOurShow.mouse.position, this.position);
        this.distance = this.delta[0]*this.delta[0] + this.delta[1]*this.delta[1];
        this.force = -1* objOurShow.mouse.radius / this.distance;
        if (this.distance < objOurShow.mouse.radius){
            this.angle = Math.atan2(this.delta[1], this.delta[0]);
            this.velocity[0] += this.force * Math.cos(this.angle) * this.friction;
            this.velocity[1] += this.force * Math.sin(this.angle) * this.friction;
        }
        // this.position+=(this.origin- this.position)*this.speedMultiplyer;
        this.position = vec2.fadd (this.position, vec2.fscale(vec2.fsubtract(this.origin, this.position), this.speedMultiplyer));
        this.position = vec2.fadd (this.position,this.velocity);
        this.position[0] = this.position[0];
        this.position[1] = this.position[1];
        if (Math.floor(this.position[0]) === Math.floor(this.origin[0]) && Math.floor(this.position[1]) === Math.floor(this.origin[1] )){
            document.getElementById("idWarpButton").style.color="white";
            return 0;
        }else{
            document.getElementById("idWarpButton").style.color="yellow";
            return 1;
        }
    }
    warp(){
        this.position = vec2.fromValues(Math.random() * objOurShow.width, Math.random()* objOurShow.height);
        this.speedMultiplyer = 0.05;
    }
}

class clsShow{
    constructor(objCanvas ){
        this.width = objCanvas.width;
        this.height = objCanvas.height;
        this.arrParticles = [];
        this.objCanvas = objCanvas;
        this.objContext = objCanvas.getContext("2d");
        this.image1 = document.getElementById("idImage1");
        this.centerX = this.width* 0.5;
        this.centerY = this.height* 0.5;
        this.image1X = this.centerX - this.image1.width * 0.5;
        this.image1Y = this.centerY - this.image1.height * 0.5;
        this.resolution = 2;
        this.gap =0;
        this.movingPixelCount=0;
        this.mouse = {
            radius:100000,
            position:vec2.create()
        };
        window.addEventListener('mousemove', event => this.mouse.position = vec2.fromValues(event.x, event.y));
    }
    init(){
        this.objContext.drawImage(this.image1,this.image1X, this.image1Y);
        const arrPixels = this.objContext.getImageData(0,0,this.width, this.height).data;
        for (let y=0; y < this.height; y+= this.resolution + this.gap){
            for(let x=0; x < this.width; x += this.resolution + this.gap){
                const index= (y * this.width + x)  * 4;
                const alpha = arrPixels[index+3];
                if (alpha > 0){
                    const colour = vec3.fromValues(arrPixels[index],arrPixels[index+1],arrPixels[index+2]);
                    const origin = vec2.fromValues(x,y);
                    this.arrParticles.push(new clsParticle(origin, colour,this.resolution)); 
                }
            }
        }
    }
    clear(){
        this.objContext.clearRect(0,0,this.width, this.height);
    }
    draw(){       
        // this.objContext.save();
        // let opacity = 1 - (this.arrParticles.length - this.movingPixelCount)/this.arrParticles.length;
        // this.objContext.globalAlpha = opacity;
        this.arrParticles.forEach(p=>p.draw(this.objContext));            
        // this.objContext.restore();

        // this.objContext.save();
        // opacity = (this.arrParticles.length - this.movingPixelCount)/this.arrParticles.length;
        // this.objContext.globalAlpha = opacity;
        // this.objContext.drawImage(this.image1,this.image1X, this.image1Y); 
        // this.objContext.restore();        
    }
    update(){
        this.movingPixelCount=0;
        this.arrParticles.forEach(p=>this.movingPixelCount += p.update());
    }
    warp(){
        this.arrParticles.forEach(p=>p.warp(this));
    }
}

function funAnimationLoop(){
    objOurShow.clear();    
    objOurShow.update();
    objOurShow.draw();

    requestAnimationFrame(funAnimationLoop);

}