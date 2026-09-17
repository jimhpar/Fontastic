import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { VisualSearchMatch } from '@fontastic/shared-types';

const API_HOST = 'http://localhost:4000/api'; // Or local network IP

export default function App() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [matches, setMatches] = useState<VisualSearchMatch[]>([]);
  const [detectedText, setDetectedText] = useState<string>('');

  // Mock Camera Snapper / Gallery Picker for cross-platform simulation
  const handleSnapPhoto = async () => {
    setAnalyzing(true);
    try {
      // In production with device: const photo = await cameraRef.takePictureAsync({ base64: true });
      const sampleText = 'COFFEE & CROISSANT';
      const res = await fetch(`${API_HOST}/vision/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin_token_demo'
        },
        body: JSON.stringify({
          imageBase64: 'data:image/png;base64,mock_mobile_photo',
          device: 'mobile',
          correctedText: sampleText
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze font');

      setMatches(data.matches || []);
      setDetectedText(data.detectedText || sampleText);
    } catch (err: any) {
      Alert.alert('Font Identification', err.message || 'Error communicating with Fontastic server');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>F</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Fontastic Mobile</Text>
          <Text style={styles.headerSubtitle}>Camera Font Finder & Wishlist</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Camera Viewfinder Card */}
        <View style={styles.cameraCard}>
          <View style={styles.viewfinderFrame}>
            <View style={styles.targetCrosshair}>
              <Text style={styles.crosshairText}>POINT AT TYPOGRAPHY</Text>
              <Text style={styles.sampleTextDisplay}>URBAN ARCHITECTURE</Text>
            </View>
          </View>

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.snapButton}
              onPress={handleSnapPhoto}
              disabled={analyzing}
            >
              {analyzing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.snapButtonText}>Snap & Identify Font</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Matches Section */}
        {matches.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Visual Font Matches</Text>
            <Text style={styles.detectedLabel}>Detected: "{detectedText}"</Text>

            {matches.map((item, idx) => (
              <View key={idx} style={styles.matchCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.fontFamily}>{item.font.family}</Text>
                  <View style={styles.similarityBadge}>
                    <Text style={styles.similarityText}>{item.similarity}% MATCH</Text>
                  </View>
                </View>

                <Text style={styles.sourceText}>{item.font.source.toUpperCase()} · {item.font.category}</Text>

                <View style={styles.previewContainer}>
                  <Text style={styles.previewText}>{detectedText}</Text>
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => Alert.alert('Wishlist', `"${item.font.family}" added to your wishlist!`)}
                >
                  <Text style={styles.saveButtonText}>Add to Wishlist</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B'
  },
  content: {
    padding: 20
  },
  cameraCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 3
  },
  viewfinderFrame: {
    height: 260,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  targetCrosshair: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center'
  },
  crosshairText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8
  },
  sampleTextDisplay: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800'
  },
  cameraControls: {
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  snapButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  snapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  resultsContainer: {
    marginTop: 8
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4
  },
  detectedLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  fontFamily: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  similarityBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  similarityText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800'
  },
  sourceText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12
  },
  previewContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12
  },
  previewText: {
    fontSize: 24,
    color: '#0F172A'
  },
  saveButton: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  saveButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700'
  }
});
