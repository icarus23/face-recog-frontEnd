import React, { useState } from 'react';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Particles from 'react-particles-js';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

function App() {
  const [ input, setInput ] = useState('');
  const [ imageUrl, setImageUrl ] = useState('');
  const [ box, setBox ] = useState({});
  const [ route, setRoute ] = useState('SignIn');
  const [ isSignedIn, setisSignedIn ] = useState(false);
  const [ user, setUser ] = useState({
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
  });

const clearState = () => {
    setInput('')
    setImageUrl('')
    setBox({})
    setRoute('SignIn')
    setisSignedIn(false)
    setUser({
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    })
}

  const loadUser = (data) => {
    setUser(Object.assign(user, {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }));
  }

  const calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }
  
  const displayFaceBox = (box) => {
    setBox(box);
  }
  
  const onInputChange = (event) => {
    setInput(event.target.value);
  }

  const onRouteChange = (route) => {
    if(route === 'SignOut') {
      clearState();
    } 
    else if(route === 'home') {
      setisSignedIn(true);
      setUser(user);
    }
    setRoute(route);
  }

  const onButtonSubmit = () => {
      setImageUrl(input);
      fetch('http://localhost:3000/imageUrl', {
          method: 'post',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            input: input
          })
        })
      .then(response => response.json())
      .then(response => {
        if(response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
              id: user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            Object.assign(user, { entries: count} )
          })
        }
        displayFaceBox(calculateFaceLocation(response) )
      })
      .catch(err => console.log(err) );
  }

  return (
    <div className="App">
      <Particles className='particles'
        params = {particlesOptions}
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      { route === 'home'
      ? <div>
          <Logo />
          <Rank name={user.name} entries={user.entries}/>
          <ImageLinkForm 
            onInputChange={onInputChange} onButtonSubmit={onButtonSubmit} />
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
      : ( route === 'SignIn'
          ? <SignIn onRouteChange={ onRouteChange } loadUser={ loadUser }/>
          : <Register onRouteChange={ onRouteChange }  loadUser={ loadUser } />
      )
    }
    </div>
  );
}

export default App;