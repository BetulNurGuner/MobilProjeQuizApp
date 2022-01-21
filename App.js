import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View,TouchableOpacity, Image, Button } from 'react-native';
import * as Notifications from 'expo-notifications';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import LogoutScreen from './screens/LogoutScreen'
import NasilOynanir from './screens/NasilOynanir'

import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


const Tab=createMaterialBottomTabNavigator()

const Drawer = createDrawerNavigator();

const Stack = createNativeStackNavigator();

function firstScreenStack({ navigation }) {
  return (
<Tab.Navigator labeled={false} barStyle={{backgroundColor:'#252C4A'}} activeColor='white'>
{
<Tab.Screen name="Login" component={LoginScreen}
  options={{
    tabBarIcon:({color,size})=>(
      <MaterialCommunityIcons name='login' color={color} size={26} />
    )
  }}
/>
}
  <Tab.Screen name="Home" component={HomeScreen}
  options={{
    tabBarIcon:({color,size})=>(
      <MaterialCommunityIcons name='home' color={color} size={26} />
    )
  }}
/>

<Tab.Screen name="SignOut" component={LogoutScreen}
  options={{
    tabBarIcon:({color,size})=>(
      <MaterialCommunityIcons name='logout' color={color} size={26} />
    )
  }}
/>

</Tab.Navigator>
  );
}


function secondScreenStack({ navigation }) {
  return (
    <Stack.Navigator
      initialRouteName={"NasilOynanir"}
      
   >
      <Stack.Screen
        name="NasilOynanir"
        component={NasilOynanir}
        options={{title: '', drawerLabel: 'Nasıl Oynanır?' }}
       
        />
       
    </Stack.Navigator>
  );
}


export default function App() {

  const [expoPushToken, setExpoPushToken] = useState('');     // expo'dan notification için token atanır
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
  registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

  // This listener is fired whenever a notification is received while the app is foregrounded
  notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    setNotification(notification);
  });

  // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
  responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    console.log(response);
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener.current);
    Notifications.removeNotificationSubscription(responseListener.current);
  };
}, []);
  return (

<NavigationContainer>

<Drawer.Navigator
  screenOptions={{
    activeTintColor: '#e91e63',
    itemStyle: { marginVertical: 5 },
    
  }}>
  <Drawer.Screen
    name="Anasayfa"
    options={{ drawerLabel: 'QuizGame' }}
    component={firstScreenStack} 
    //component={HomeScreen}
    
    />
  <Drawer.Screen
    name="Nasıl Oynanır"
    options={{ drawerLabel: 'Nasıl Oynanır?' }}
    component={secondScreenStack}
     />

</Drawer.Navigator>
<Button
        title="Uygulama Hakkında"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
</NavigationContainer>


  );


}

// Bildirim Gönderme Fonksiyonu gönderilecek bildirim burda ayarlanıyor.
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Hoşgeldiniz!',
    body: 'QuizGame Uygulamasına Hoşgeldiniz! Uygulama hakkında bilgi edinmek için Drawerdan Nasıl Oynanır Bölümüne geçebilirsiniz. İyi eğlenceler dileriz!',
    data: { someData: 'goes here' },
    
  };

  await fetch(
    
    'https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
    
   
  } );
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
