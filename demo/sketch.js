let song;

let flower;
let allFlowers = [];

let transformedSpecPos=[];
let transformedSpecValue=[];

let layer1; // layer1 draw static object

let step = 10;
let flowerHeightRecord=[];

let flowerColors = [];

let start=false;

let slider1,slider2;

function preload() 
{
	// Fill in the url for your audio asset
	song = loadSound("1.mp3");
}

function setup() 
{
	//cnv = createCanvas(600, 400);
    createCanvas(windowWidth, windowHeight);

	// Create a new FFT analysis object
	fft = new p5.FFT();
	// Add the song (sample) into the FFT's input
	song.connect(fft);
	
	//create layers
	layer1 = createGraphics(width, height);
	
	slider1 = createSlider(0.3, 2, 1,0.1);
    slider1.position(10, 10);
	slider1.size(100, 20);
    slider1.hide();
	slider1.addClass("mySliders");
	
	slider2 = createSlider(0.5, 3, 1,0.1);
    slider2.position(150, 10);
	slider2.size(100, 20);
	slider2.hide();
    slider2.addClass("mySliders");
	
	for (let i = 0; i < width; i += step) 
	{
		let vector = createVector(i,height);
		flowerHeightRecord.push(vector);
	}
	
    flowerColors.push(color(157,112,191));
    flowerColors.push(color(168,133,195));
    flowerColors.push(color(207,188,226));
    flowerColors.push(color(181,161,227));
    flowerColors.push(color(208,179,227));
    flowerColors.push(color(209,194,211));
    flowerColors.push(color(165,54,202));
    flowerColors.push(color(195,166,203));
    
	frameRate(30);
    background(0);
}

function draw() 
{
	background(0);
	image(layer1, 0, 0);
	if(start==false)
	{
		fill(255);
        stroke(255);
		textSize(30);
		textAlign(CENTER);
		text('Click to start !', width/2, height/2);
		return;
	}
	noStroke();

	// Request fresh data from the FFT analysis
	let spectrum = fft.analyze();
    
	fill(243,240,231,200); // spectrum color

	transformedSpecPos = [];
	transformedSpecValue = [];
	//draw the spectrum using a log scale to show energy per octave
	for (let i = 0; i < spectrum.length; i++) 
	{
		let x = map(log(i), 0, log(spectrum.length), 0, width);
		let h = map(spectrum[i], 0, 255, 0, height);
		let rectangle_width = (log(i + 1) - log(i)) * (width / log(spectrum.length));
		rect(x, height, rectangle_width, -h*0.3)
		
		transformedSpecPos.push(x);
		transformedSpecValue.push(h);
	}
	
	for (let i = 0; i < width; i += step)
	{
		let max = -1;
		for (let m = 0; m < transformedSpecPos.length; m++) 
		{
			if(transformedSpecPos[m] >= i && transformedSpecPos[m] < i+step)
			{
				if(transformedSpecValue[m]>max)
				{
					max = transformedSpecValue[m];
				}
			}
		}
		fill(86,0,79,220);
		rect(i, height, step*0.7*slider1.value(), -max*0.3);
		
		//add flower
		if(max>0.5*height && frameCount%60==0)
		{
			flower = new Flower(i+random(step)+10, 0, i/step);
			allFlowers.push(flower);
		}
	}
	
	//draw flowers
	for(let i=0;i<allFlowers.length;i++)
	{
	  if(!allFlowers[i].dead && allFlowers[i].y > flowerHeightRecord[allFlowers[i].index].y - allFlowers[i].s*2)
	  {
		  flowerHeightRecord[allFlowers[i].index].y = allFlowers[i].y;
		  allFlowers[i].dead = true;
	  }
	  allFlowers[i].display();
	}
	
	let toDelete = [];
	for(let i=0;i<allFlowers.length;i++)
	{
		if(allFlowers[i].dead)
		{
			toDelete.push(i);
			allFlowers[i].display1();
		}
	}
	
	//delete dead item
	for (let i = toDelete.length - 1; i >= 0; i--) 
	{
		let index = toDelete[i];
		allFlowers.splice(index, 1);
	}

}

// Toggle playback on or off with a mouse click
function mousePressed() 
{
	if (song.isPlaying()) 
	{
	} 
	else 
	{
		start = true;
		song.play();
		slider1.show();
		slider2.show();
	}
}

//flower class
class Flower
{
  constructor(_x,_y,_index)
  {
    this.x=_x;//position X
    this.y=_y;//position Y
	this.speedX = 0;
	this.speedY = random(1,5);
    this.s=random(5,10);//size
	this.sCopy = this.s;
	this.index = _index;
	this.dead=false;
    
    //color
    let colorIndex=int(random(flowerColors.length));
    this.c = flowerColors[colorIndex];
    this.angle=random(0,3.14);//angle
    this.petalNum=int(random(5,10));//petal number

  }
  
  display1()
  {
	//draw flower
	layer1.push();
	layer1.fill(this.c);
	layer1.translate(this.x,this.y);
	layer1.noStroke();
	for(let i=0;i<this.petalNum;++i)
	{
	  layer1.push();
	  layer1.rotate(2*PI/this.petalNum*i+this.angle);
	  layer1.ellipse(this.s/2+3,0,this.s,this.s/this.petalNum*5);
	  layer1.pop();
	}
	
	layer1.ellipse(0,0,5,5);
	layer1.pop();
  }
  

  display()
  {
	if(this.dead == false)
	{
		this.x += this.speedX;
		this.y += this.speedY;
	
		this.s = this.sCopy*slider2.value();
		//draw flower
		push();
		fill(this.c);
		translate(this.x,this.y);
		noStroke();
		for(let i=0;i<this.petalNum;++i)
		{
		  push();
		  rotate(2*PI/this.petalNum*i+this.angle);
		  ellipse(this.s/2+3,0,this.s,this.s/this.petalNum*5);
		  pop();
		}
		
		ellipse(0,0,5,5);
		pop();
	}
  }
}

function mouseClicked() 
{
	flower = new Flower(mouseX,mouseY,0);
	allFlowers.push(flower);
}