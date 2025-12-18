/**
 * PhotoUploadScreen
 *
 * Step 3 of the Sell Vehicle flow.
 * Allows users to upload up to 20 photos of their vehicle.
 * First photo is automatically set as the cover image.
 *
 * Design: Follows brand guidelines with gradient background,
 * proper typography, and consistent spacing.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../navigation';

// Design System
import { Text, Spacer, Button } from '../../design-system';
import { Colors, Spacing, BorderRadius, Shadows } from '../../design-system/primitives';

// Context
import { useSell } from '../../contexts/SellContext';

type PhotoUploadScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PhotoUpload'
>;

type PhotoUploadScreenRouteProp = RouteProp<RootStackParamList, 'PhotoUpload'>;

interface PhotoUploadScreenProps {
  navigation: PhotoUploadScreenNavigationProp;
  route: PhotoUploadScreenRouteProp;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2 - Spacing.md * 2) / 3;
const MAX_PHOTOS = 20;
const MIN_PHOTOS = 1;
const TOTAL_STEPS = 7;
const CURRENT_STEP = 3;

export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({ navigation, route }) => {
  const { listingData, setPhotos, addPhoto, removePhoto } = useSell();
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const fromReview = route.params?.fromReview ?? false;

  // Request permissions
  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll access to upload photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }, []);

  // Pick single image
  const handlePickImage = useCallback(async () => {
    if (listingData.photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum Photos', `You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsPickerLoading(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: MAX_PHOTOS - listingData.photos.length,
      });

      if (!result.canceled && result.assets) {
        result.assets.forEach((asset) => {
          addPhoto(asset.uri);
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsPickerLoading(false);
    }
  }, [listingData.photos.length, requestPermissions, addPhoto]);

  // Take photo with camera
  const handleTakePhoto = useCallback(async () => {
    if (listingData.photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum Photos', `You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera access to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsPickerLoading(true);

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        addPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsPickerLoading(false);
    }
  }, [listingData.photos.length, addPhoto]);

  // Remove photo
  const handleRemovePhoto = useCallback(
    (index: number) => {
      Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removePhoto(index) },
      ]);
    },
    [removePhoto]
  );

  // Set as cover (move to first position)
  const handleSetAsCover = useCallback(
    (index: number) => {
      if (index === 0) return;

      const photos = [...listingData.photos];
      const [photo] = photos.splice(index, 1);
      photos.unshift(photo);
      setPhotos(photos);
    },
    [listingData.photos, setPhotos]
  );

  // Handle continue
  const handleContinue = useCallback(() => {
    if (listingData.photos.length < MIN_PHOTOS) {
      Alert.alert('Photos Required', `Please upload at least ${MIN_PHOTOS} photo${MIN_PHOTOS > 1 ? 's' : ''}.`);
      return;
    }
    if (fromReview) {
      navigation.goBack();
    } else {
      navigation.navigate('ConditionReport');
    }
  }, [listingData.photos.length, navigation, fromReview]);

  // Handle back
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const canContinue = listingData.photos.length >= MIN_PHOTOS;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={styles.headerTitle}>
          Upload Photos
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Section - Hidden when editing from review */}
        {!fromReview && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(CURRENT_STEP / TOTAL_STEPS) * 100}%` },
                  ]}
                />
              </View>
            </View>
            <Text variant="caption" color="textMuted" style={styles.stepText}>
              Step {CURRENT_STEP} of {TOTAL_STEPS}
            </Text>
          </View>
        )}

        {!fromReview && <Spacer size="xs" />}

        {/* Photo Count Card */}
        <View style={styles.photoCountCard}>
          <View style={styles.photoCountIconWrapper}>
            <Ionicons name="images" size={20} color={Colors.primary} />
          </View>
          <View style={styles.photoCountInfo}>
            <View style={styles.photoCountRow}>
              <Text variant="bodySmall" weight="bold" color="primary">
                {listingData.photos.length}
              </Text>
              <Text variant="label" color="textMuted">
                / {MAX_PHOTOS} photos
              </Text>
            </View>
            <Text variant="label" color="textSecondary">
              First photo will be the cover image
            </Text>
          </View>
        </View>

        <Spacer size="lg" />

        {/* Upload Buttons */}
        <View style={styles.uploadButtonsRow}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={isPickerLoading || listingData.photos.length >= MAX_PHOTOS}
            activeOpacity={0.7}
          >
            <View style={styles.uploadButtonIcon}>
              <Ionicons name="images-outline" size={20} color={Colors.primary} />
            </View>
            <Text variant="label" weight="semibold" color="primary">
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleTakePhoto}
            disabled={isPickerLoading || listingData.photos.length >= MAX_PHOTOS}
            activeOpacity={0.7}
          >
            <View style={styles.uploadButtonIcon}>
              <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            </View>
            <Text variant="label" weight="semibold" color="primary">
              Camera
            </Text>
          </TouchableOpacity>
        </View>

        <Spacer size="lg" />

        {/* Photo Grid */}
        {listingData.photos.length > 0 ? (
          <View style={styles.photoGridCard}>
            <View style={styles.photoGrid}>
              {listingData.photos.map((uri, index) => (
                <View key={`photo-${index}`} style={styles.photoContainer}>
                  <Image source={{ uri }} style={styles.photo} resizeMode="cover" />

                  {/* Cover Badge */}
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Ionicons name="star" size={8} color={Colors.white} />
                      <Text variant="label" weight="semibold" style={styles.coverBadgeText}>
                        Cover
                      </Text>
                    </View>
                  )}

                  {/* Photo Number */}
                  <View style={styles.photoNumber}>
                    <Text variant="label" weight="semibold" style={styles.photoNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.photoActions}>
                    {index !== 0 && (
                      <TouchableOpacity
                        style={styles.photoActionButton}
                        onPress={() => handleSetAsCover(index)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="star-outline" size={14} color={Colors.white} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.photoActionButton, styles.photoActionButtonDelete]}
                      onPress={() => handleRemovePhoto(index)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={14} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Add More Button */}
              {listingData.photos.length < MAX_PHOTOS && (
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={28} color={Colors.primary} />
                  <Text variant="caption" color="primary">
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          // Empty State
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="images-outline" size={32} color={Colors.textMuted} />
            </View>
            <Spacer size="md" />
            <Text variant="bodySmall" weight="semibold" color="textSecondary" align="center">
              No photos added yet
            </Text>
            <Text variant="label" color="textMuted" align="center">
              Add photos to showcase your vehicle
            </Text>
          </View>
        )}

        <Spacer size="lg" />

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIconWrapper}>
              <Ionicons name="bulb" size={16} color={Colors.warning} />
            </View>
            <Text variant="bodySmall" weight="semibold" color="text">
              Photo Tips
            </Text>
          </View>
          <Spacer size="sm" />
          <View style={styles.tipsGrid}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text variant="label" color="textSecondary" style={styles.tipText}>
                Good lighting
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text variant="label" color="textSecondary" style={styles.tipText}>
                All angles
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text variant="label" color="textSecondary" style={styles.tipText}>
                Interior shots
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text variant="label" color="textSecondary" style={styles.tipText}>
                Show damage
              </Text>
            </View>
          </View>
        </View>

        <Spacer size="xl" />

        {/* Continue/Done Button */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={handleContinue}
          disabled={!canContinue}
          iconRight={fromReview ? 'checkmark' : 'arrow-forward'}
        >
          {fromReview ? 'Done' : 'Continue'}
        </Button>

        <Spacer size="2xl" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },

  // Progress
  progressSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  stepText: {
    letterSpacing: 0.5,
  },

  // Photo Count Card
  photoCountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  photoCountIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  photoCountInfo: {
    flex: 1,
  },
  photoCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },

  // Upload Buttons
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary + '25',
    borderStyle: 'dashed',
    ...Shadows.sm,
  },
  uploadButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },

  // Photo Grid Card
  photoGridCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  coverBadgeText: {
    color: Colors.white,
    fontSize: 9,
  },
  photoNumber: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.text + 'CC',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoNumberText: {
    color: Colors.white,
    fontSize: 10,
  },
  photoActions: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  photoActionButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.text + 'AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActionButtonDelete: {
    backgroundColor: Colors.accent + 'DD',
  },
  addMoreButton: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },

  // Empty State
  emptyStateCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.md,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tips Card
  tipsCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '25',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tipsIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    width: '48%',
  },
  tipText: {
    flex: 1,
  },
});

export default PhotoUploadScreen;
