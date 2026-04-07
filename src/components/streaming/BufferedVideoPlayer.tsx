import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { config } from '@/constants/config';

interface BufferedVideoPlayerProps {
  streamId: string;
  isActive?: boolean;
}

/**
 * BufferedVideoPlayer uses an internal WebView to run jmuxer,
 * which takes fragmented MP4 segments from a WebSocket and plays them using MediaSource.
 */
export const BufferedVideoPlayer: React.FC<BufferedVideoPlayerProps> = ({
  streamId,
  isActive = true,
}) => {
  const wsUrl = `${config.INGESTION_WS_URL}?stream_id=${streamId}`;

  const htmlContent = useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: black; overflow: hidden; }
          video { width: 100%; height: 100%; object-fit: contain; }
          #status { position: absolute; top: 10px; left: 10px; color: white; font-family: sans-serif; font-size: 10px; background: rgba(0,0,0,0.5); padding: 4px; border-radius: 4px; z-index: 100; pointer-events: none; }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jmuxer@1.1.2/dist/jmuxer.min.js"></script>
      </head>
      <body>
        <div id="status">Connecting...</div>
        <video id="player" autoplay muted playsinline></video>
        <script>
          const statusEl = document.getElementById('status');
          const player = document.getElementById('player');
          let jmuxer;

          function init() {
            jmuxer = new JMuxer({
              node: 'player',
              mode: 'video',
              flushingTime: 1000, // 1 second segments
              fps: 15,
              debug: false,
              onError: function(err) {
                statusEl.innerText = 'Error: ' + err;
              }
            });

            const ws = new WebSocket('${wsUrl}');
            ws.binaryType = 'arraybuffer';

            ws.onopen = () => {
              statusEl.innerText = 'Connected - Buffering...';
            };

            ws.onmessage = (event) => {
              if (event.data instanceof ArrayBuffer) {
                jmuxer.feed({
                  video: new Uint8Array(event.data)
                });
                statusEl.style.display = 'none';
              }
            };

            ws.onclose = () => {
              statusEl.innerText = 'Disconnected';
              statusEl.style.display = 'block';
              setTimeout(init, 3000); // Reconnect attempt
            };

            ws.onerror = (e) => {
              statusEl.innerText = 'WS Error';
            };
          }

          // Start after a slight delay to ensure DOM is ready
          setTimeout(init, 500);
        </script>
      </body>
    </html>
  `, [wsUrl]);

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        backgroundColor="#000"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
