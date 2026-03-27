import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import colors from '@/constants/colors';

const HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: ${colors.background};
      overflow: hidden;
    }
    #jf-agent-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="jf-agent-container"></div>
  <script src='https://cdn.jotfor.ms/agent/embedjs/019bb8670e68741cabf406d466a3cd121d92/embed.js'></script>
</body>
</html>
`;

export default function AgentScreen() {

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Orive Spirit Guide',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: '700' as const,
          },
          headerTintColor: colors.text,
        }}
      />
      <View style={styles.container}>
        <WebView
          source={{ html: HTML_CONTENT }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={true}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
