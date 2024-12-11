import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Platform, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { ScrollView } from 'react-native';

export default function OrdersScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const INJECTED_JAVASCRIPT = `
    (function() {
      const style = document.createElement('style');
      style.textContent = 'body { padding-bottom: 60px !important; }';
      document.head.appendChild(style);

      // Add pull to refresh functionality
      let touchstartY = 0;
      let touchendY = 0;
      
      document.addEventListener('touchstart', e => {
        touchstartY = e.touches[0].clientY;
      });
      
      document.addEventListener('touchend', e => {
        touchendY = e.changedTouches[0].clientY;
        if (window.scrollY === 0 && touchendY > touchstartY + 100) {
          window.ReactNativeWebView.postMessage('refresh');
        }
      });
    })();
    true;
  `;

  const handleMessage = (event: any) => {
    if (event.nativeEvent.data === 'refresh') {
      handleRefresh();
    }
  };

  const handleRefresh = () => {
    if (!isLoading) {
      setIsLoading(true);
      setRefreshing(true);
      webViewRef.current?.reload();
      setTimeout(() => {
        setIsLoading(false);
        setRefreshing(false);
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
      >
        <ThemedView style={styles.container}>
          <WebView 
            ref={webViewRef}
            source={{ uri: 'https://deliveryapp-tan.vercel.app' }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={handleMessage}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 0 : 0,
  },
  
  
}); 