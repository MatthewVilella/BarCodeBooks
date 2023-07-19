import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthContextProvider } from './screens/AuthContext';
import Navigator from './routes/homeStack';

export default function App() {
  return (
    // The top-level container that holds the entire app
    <View style={styles.container}>
      {/* Context provider for authentication */}
      <AuthContextProvider>
        {/* Navigator component responsible for handling app navigation */}
        <Navigator />
      </AuthContextProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#324d6f',
  },
});
