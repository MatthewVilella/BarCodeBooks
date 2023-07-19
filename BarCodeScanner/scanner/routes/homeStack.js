// Importing necessary components from React Navigation library
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';

// Importing screen components from respective paths
import BarCodeScannerCamera from '../screens/BarCodeScannerCamera';
import UpcItemsDetails from '../screens/UpcItemsDetails';
import SearchScreen from '../screens/SearchScreen';
import LogInMenu from '../screens/LogInMenu';
import UserRegistrationScreen from '../screens/UserRegistrationScreen';
import HomePage from '../screens/HomePage';

// Defining the screens configuration object
const screens = {
     HomePage: {
        screen: HomePage
    },
    LogInMenu: {
        screen: LogInMenu,
    },
    BarCodeScannerCamera: {
        screen: BarCodeScannerCamera,
    },
    UpcItemsDetails: {
        screen: UpcItemsDetails,
    },
    SearchScreen: {
        screen: SearchScreen,
    },
    UserRegistrationScreen: {
        screen: UserRegistrationScreen,
    },
};

// Creating a stack navigator with the defined screens and custom options
const HomeStack = createStackNavigator(screens, {
    headerMode: 'none', // Disable the header for all screens in the stack
    defaultNavigationOptions: {
        cardStyle: {
            flex: 1,
            backgroundColor: '#324d6f',
        },
    },
});

// Creating the app container and assigning the HomeStack navigator as the root navigator
export default createAppContainer(HomeStack);
