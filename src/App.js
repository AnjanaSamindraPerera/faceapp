import React,{Component} from 'react';
import Navigation from './Components/Navigation/Navigation.js'
import './App.css';
import Logo from './Components/Logo/Logo.js';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm.js'
import Rank from './Components/Rank/Rank.js'
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition.js'
import Signin from './Components/Signin/Signin.js'
import Register from './Components/Register/Register.js'


const app = new Clarifai.App({
  apiKey: '4e2a10a76e0c4b56aa7b7e3c7919a5de'
 });

 

class App extends Component {

constructor(){
  super();
  this.state={
    input:'',
    imageUrl:'',
    box:{} , //object
    route:'signin',
    isSignedIn:false,
    user:{
      id:'',
      name:'',
      email:'',
      password:'',
      entries:0,
      joined:''
  
    }
  }

}

loadUser=(data)=>{

  this.setState({user:{

    id:data.id,
    name:data.name,
    email:data.email,
    password:data.password,
    entries:data.entries,
    joined:data.joined


  }})


} 

componentDidMount(){
    fetch('http://localhost:3000/')
    .then(response=>response.json())
    .then(console.log);

}




calculateFaceLocation=(data)=>{

const clarifaiFace=  data.outputs[0].data.regions[0].region_info.bounding_box;
  const image=document.getElementById('inputimage');
  const width=Number(image.width);
  const height=Number(image.height);
  return({

    leftCol:clarifaiFace.left_col*width,
    topRow:clarifaiFace.top_row*height,
    rightCol:width-(clarifaiFace.right_col*width),
    bottomRow:height-(clarifaiFace.bottom_row*height)
  })

}

displayFaceBox=(box)=>{
  this.setState({box:box});
  console.log(box);
}


onInputChange=(event)=>{

  this.setState({input:event.target.value});
  console.log(this.input)
}




onSubmit=()=>{
  console.log(this.state.user.id)
  this.setState({imageUrl:this.state.input});
 
  //console.log('click');
  app.models.predict(
    Clarifai.FACE_DETECT_MODEL,
     this.state.input)
     .then(response=> {
      
      if(response){
        fetch('http://localhost:3000/image',{
        method:'put',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          id:this.state.user.id
        })
      })
      .then(response=>response.json())
      .then(count=>{
        this.setState(Object.assign(this.state.user,{entries:count}))
      })

      }

    
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
     .catch(err=>console.log(err) )

}

onRouteChange=(route)=>{
  if(route==='signout'){
    this.setState({isSignedIn:false})
  }
  else if(route==='home')
  this.setState({isSignedIn:true});
  
  this.setState({route:route});
} 

render(){
  return (
    <div className="App">
      
      <Particles className='particles'
              params={{
            		particles: {
            			number:{
                    value:300,
                    density:{
                      enable:true,
                      value_area:800
                    }
                  }
            			}
            		}
            	}
            
            />


     <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>  
     
     {
       this.state.route==='home'
     ? <div>
       <Logo/>

     
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
        <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onButtonSubmit={this.onSubmit}/>

        <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/> 
        </div> 
        :(
          this.state.route==='signin'?<Signin  loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
        
     
     }
      
    </div>
  );
}
}
export default App;
