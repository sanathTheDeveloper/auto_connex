/**
 * EditListingScreen Component
 *
 * Allows sellers to edit their published listings.
 * Some fields are locked after publishing (registration, VIN, make, model, year).
 * Uses accordions for organized editing sections.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  ScaledSize,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation';

// Design System
import { Text, Button, Spacer, Accordion } from '../design-system';
import { Colors, Spacing, SpacingMobile, BorderRadius, Shadows } from '../design-system/primitives';

/**
 * Get responsive spacing based on viewport width
 */
const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

// Context
import {
  useMyListings,
  ListingStatus,
  PublishedListing,
} from '../contexts/MyListingsContext';
import {
  VehicleBasicDetails,
  ConditionReport,
  ConditionItem,
  AfterMarketExtra,
  PricingDetails,
  PickupLocation,
  WriteOffDetails,
  maskVIN,
  generateId,
} from '../contexts/SellContext';

// Data
import { formatMileage, getVehicleBackgroundImage } from '../data/vehicles';

// ============================================================================
// TYPES
// ============================================================================

type EditListingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditListing'>;
type EditListingScreenRouteProp = RouteProp<RootStackParamList, 'EditListing'>;

interface EditListingScreenProps {
  navigation: EditListingScreenNavigationProp;
  route: EditListingScreenRouteProp;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Locked field display (read-only)
 */
interface LockedFieldProps {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const LockedField: React.FC<LockedFieldProps> = ({ label, value, icon }) => (
  <View style={styles.lockedField}>
    <View style={styles.lockedFieldHeader}>
      {icon && <Ionicons name={icon} size={16} color={Colors.textMuted} />}
      <Text variant="caption" style={styles.lockedFieldLabel}>{label}</Text>
      <Ionicons name="lock-closed" size={12} color={Colors.textMuted} style={styles.lockIcon} />
    </View>
    <Text variant="body" style={styles.lockedFieldValue}>{value}</Text>
  </View>
);

/**
 * Editable text field
 */
interface EditableFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  multiline?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  icon,
}) => (
  <View style={styles.editableField}>
    <View style={styles.editableFieldHeader}>
      {icon && <Ionicons name={icon} size={16} color={Colors.primary} />}
      <Text variant="caption" style={styles.editableFieldLabel}>{label}</Text>
    </View>
    <TextInput
      style={[styles.editableFieldInput, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      keyboardType={keyboardType}
      multiline={multiline}
    />
  </View>
);

/**
 * Status toggle buttons
 */
interface StatusToggleProps {
  status: ListingStatus;
  onStatusChange: (status: ListingStatus) => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ status, onStatusChange }) => {
  const statuses: { value: ListingStatus; label: string; color: string }[] = [
    { value: 'available', label: 'Available', color: Colors.success },
    { value: 'pending', label: 'Pending', color: Colors.warning },
    { value: 'sold', label: 'Sold', color: Colors.accent },
  ];

  return (
    <View style={styles.statusToggleContainer}>
      {statuses.map((s) => (
        <TouchableOpacity
          key={s.value}
          style={[
            styles.statusToggleButton,
            status === s.value && { backgroundColor: s.color + '20', borderColor: s.color },
          ]}
          onPress={() => onStatusChange(s.value)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.statusToggleDot,
              { backgroundColor: status === s.value ? s.color : Colors.textMuted + '40' },
            ]}
          />
          <Text
            variant="bodySmall"
            weight={status === s.value ? 'semibold' : 'regular'}
            style={{ color: status === s.value ? s.color : Colors.textMuted }}
          >
            {s.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Photo thumbnail with remove option
 */
interface PhotoThumbnailProps {
  uri: string;
  index: number;
  onRemove: (index: number) => void;
}

const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({ uri, index, onRemove }) => (
  <View style={styles.photoThumbnailContainer}>
    <Image source={{ uri }} style={styles.photoThumbnail} />
    <TouchableOpacity
      style={styles.photoRemoveButton}
      onPress={() => onRemove(index)}
      activeOpacity={0.7}
    >
      <Ionicons name="close" size={14} color={Colors.white} />
    </TouchableOpacity>
    {index === 0 && (
      <View style={styles.primaryPhotoBadge}>
        <Text variant="caption" style={styles.primaryPhotoText}>Primary</Text>
      </View>
    )}
  </View>
);

/**
 * Condition item row
 */
interface ConditionItemRowProps {
  item: ConditionItem;
  type: 'pros' | 'cons' | 'defects';
  onRemove: () => void;
  onUpdate: (description: string) => void;
}

const ConditionItemRow: React.FC<ConditionItemRowProps> = ({ item, type, onRemove, onUpdate }) => {
  const getIconConfig = () => {
    switch (type) {
      case 'pros':
        return { icon: 'checkmark-circle' as const, color: Colors.success };
      case 'cons':
        return { icon: 'alert-circle' as const, color: Colors.warning };
      case 'defects':
        return { icon: 'close-circle' as const, color: Colors.accent };
    }
  };

  const config = getIconConfig();

  return (
    <View style={styles.conditionItemRow}>
      <View style={styles.conditionItemContent}>
        <Ionicons name={config.icon} size={20} color={config.color} />
        <TextInput
          style={styles.conditionItemInput}
          value={item.description}
          onChangeText={onUpdate}
          placeholder="Enter description..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
      <TouchableOpacity onPress={onRemove} activeOpacity={0.7} style={styles.removeIconButton}>
        <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Aftermarket extra row
 */
interface ExtraItemRowProps {
  extra: AfterMarketExtra;
  onRemove: () => void;
  onUpdate: (name: string) => void;
}

const ExtraItemRow: React.FC<ExtraItemRowProps> = ({ extra, onRemove, onUpdate }) => (
  <View style={styles.extraItemRow}>
    <View style={styles.extraIconWrapper}>
      <Ionicons name="build" size={18} color={Colors.primary} />
    </View>
    <TextInput
      style={styles.extraNameInput}
      value={extra.name}
      onChangeText={(text) => onUpdate(text)}
      placeholder="Extra name..."
      placeholderTextColor={Colors.textMuted}
    />
    <TouchableOpacity onPress={onRemove} activeOpacity={0.7}>
      <Ionicons name="close-circle" size={22} color={Colors.accent} />
    </TouchableOpacity>
  </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EditListingScreen({ navigation, route }: EditListingScreenProps) {
  const { listingId } = route.params;
  const { getListingById, updateListing, deleteListing, isSaving } = useMyListings();

  // Get the listing data
  const listing = getListingById(listingId);

  // Viewport state for responsive design
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  // Listen for viewport changes (for web browser resize/inspect mode)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Responsive values
  const responsivePadding = getResponsiveSpacing('lg', viewportWidth);
  const responsiveGap = getResponsiveSpacing('md', viewportWidth);

  // Local state for editing
  const [status, setStatus] = useState<ListingStatus>('available');
  const [photos, setPhotos] = useState<string[]>([]);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleBasicDetails | null>(null);
  const [conditionReport, setConditionReport] = useState<ConditionReport>({
    pros: [],
    cons: [],
    defects: [],
  });
  const [afterMarketExtras, setAfterMarketExtras] = useState<AfterMarketExtra[]>([]);
  const [pricing, setPricing] = useState<PricingDetails>({ askingPrice: 0, negotiable: true });
  const [pickupLocation, setPickupLocation] = useState<PickupLocation>({
    streetAddress: '',
    suburb: '',
    state: '',
    postcode: '',
  });
  const [writeOff, setWriteOff] = useState<WriteOffDetails>({ isWriteOff: false });
  const [hasChanges, setHasChanges] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Initialize state from listing
  useEffect(() => {
    if (listing) {
      setStatus(listing.status);
      setPhotos([...listing.photos]);
      setVehicleDetails(listing.vehicleDetails);
      setConditionReport({ ...listing.conditionReport });
      setAfterMarketExtras([...listing.afterMarketExtras]);
      setPricing({ ...listing.pricing });
      setPickupLocation({ ...listing.pickupLocation });
      setWriteOff({ ...listing.writeOff });
    }
  }, [listing?.listingId]);

  // Mark as changed when any field updates
  const markChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  // Handle photo removal
  const handleRemovePhoto = useCallback((index: number) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setPhotos((prev) => prev.filter((_, i) => i !== index));
          markChanged();
        },
      },
    ]);
  }, [markChanged]);

  // Handle photo picker
  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll access to upload photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 20 - photos.length,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map((asset) => asset.uri);
        setPhotos((prev) => [...prev, ...newPhotos]);
        markChanged();
        setShowPhotoModal(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, [photos.length, markChanged]);

  // Handle camera
  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos((prev) => [...prev, result.assets[0].uri]);
        markChanged();
        setShowPhotoModal(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  }, [markChanged]);

  // Handle condition item updates
  const handleAddConditionItem = useCallback((type: 'pros' | 'cons' | 'defects') => {
    const newItem: ConditionItem = { id: generateId(), description: '' };
    setConditionReport((prev) => ({
      ...prev,
      [type]: [...prev[type], newItem],
    }));
    markChanged();
  }, [markChanged]);

  const handleRemoveConditionItem = useCallback((type: 'pros' | 'cons' | 'defects', id: string) => {
    setConditionReport((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.id !== id),
    }));
    markChanged();
  }, [markChanged]);

  const handleUpdateConditionItem = useCallback((type: 'pros' | 'cons' | 'defects', id: string, description: string) => {
    setConditionReport((prev) => ({
      ...prev,
      [type]: prev[type].map((item) =>
        item.id === id ? { ...item, description } : item
      ),
    }));
    markChanged();
  }, [markChanged]);

  // Handle extras updates
  const handleAddExtra = useCallback(() => {
    const newExtra: AfterMarketExtra = { id: generateId(), name: '', cost: 0 };
    setAfterMarketExtras((prev) => [...prev, newExtra]);
    markChanged();
  }, [markChanged]);

  const handleRemoveExtra = useCallback((id: string) => {
    setAfterMarketExtras((prev) => prev.filter((e) => e.id !== id));
    markChanged();
  }, [markChanged]);

  const handleUpdateExtra = useCallback((id: string, name: string) => {
    setAfterMarketExtras((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name } : e))
    );
    markChanged();
  }, [markChanged]);

  // Handle save
  const handleSave = async () => {
    if (!vehicleDetails) return;

    try {
      await updateListing(listingId, {
        status,
        photos,
        vehicleDetails,
        conditionReport,
        afterMarketExtras,
        pricing,
        pickupLocation,
        writeOff,
      });
      setHasChanges(false);
      Alert.alert('Success', 'Listing updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update listing. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListing(listingId);
              navigation.navigate('MyListings');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete listing. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handle back with unsaved changes
  const handleBack = () => {
    const navigateBack = () => {
      // Always navigate to MyListings for consistent behavior
      navigation.navigate('MyListings');
    };

    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: navigateBack },
        ]
      );
    } else {
      navigateBack();
    }
  };

  if (!listing || !vehicleDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="body" color="textMuted">Listing not found</Text>
          <Spacer size="md" />
          <Button onPress={() => navigation.navigate('MyListings')} variant="outline">Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text variant="body" weight="semibold" style={styles.headerTitle}>
            Edit Listing
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Vehicle Summary Card (Locked Info) */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="car" size={20} color={Colors.primary} />
              <Text variant="body" weight="semibold" style={styles.summaryTitle}>
                Vehicle Information
              </Text>
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={12} color={Colors.textMuted} />
                <Text variant="caption" style={styles.lockedBadgeText}>Locked</Text>
              </View>
            </View>
            <Text variant="caption" color="textMuted" style={styles.summarySubtitle}>
              These fields cannot be edited after publishing
            </Text>

            <Spacer size="md" />

            <View style={styles.lockedFieldsGrid}>
              <LockedField label="Registration" value={vehicleDetails.registration} icon="document-text-outline" />
              <LockedField label="VIN" value={maskVIN(vehicleDetails.vin)} icon="barcode-outline" />
              <LockedField label="Make" value={vehicleDetails.make} icon="car-outline" />
              <LockedField label="Model" value={vehicleDetails.model} icon="car-sport-outline" />
              <LockedField label="Year" value={vehicleDetails.year.toString()} icon="calendar-outline" />
            </View>
          </View>

          <Spacer size="lg" />

          {/* Status Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flag" size={20} color={Colors.primary} />
              <Text variant="body" weight="semibold">Listing Status</Text>
            </View>
            <Spacer size="sm" />
            <StatusToggle
              status={status}
              onStatusChange={(s) => {
                setStatus(s);
                markChanged();
              }}
            />
          </View>

          <Spacer size="md" />

          {/* Photos Accordion */}
          <Accordion
            title="Photos"
            icon="camera-outline"
            defaultExpanded={false}
          >
            <View style={styles.photosGrid}>
              {photos.map((uri, index) => (
                <PhotoThumbnail
                  key={index}
                  uri={uri}
                  index={index}
                  onRemove={handleRemovePhoto}
                />
              ))}
              {photos.length === 0 && (
                <View style={styles.noPhotosContainer}>
                  <Ionicons name="images-outline" size={32} color={Colors.textMuted} />
                  <Text variant="caption" color="textMuted">No photos uploaded</Text>
                </View>
              )}
            </View>
            <Spacer size="md" />
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => setShowPhotoModal(true)}
              activeOpacity={0.7}
              disabled={photos.length >= 20}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text variant="bodySmall" weight="semibold" style={{ color: Colors.white }}>
                Add Photos ({photos.length}/20)
              </Text>
            </TouchableOpacity>
          </Accordion>

          <Spacer size="md" />

          {/* Vehicle Details Accordion */}
          <Accordion
            title="Vehicle Details"
            icon="information-circle-outline"
            defaultExpanded={false}
          >
            <EditableField
              label="Variant"
              value={vehicleDetails.variant}
              onChangeText={(text) => {
                setVehicleDetails({ ...vehicleDetails, variant: text });
                markChanged();
              }}
              icon="car-sport-outline"
            />
            <EditableField
              label="Color"
              value={vehicleDetails.color}
              onChangeText={(text) => {
                setVehicleDetails({ ...vehicleDetails, color: text });
                markChanged();
              }}
              icon="color-palette-outline"
            />
            <EditableField
              label="Body Type"
              value={vehicleDetails.bodyType}
              onChangeText={(text) => {
                setVehicleDetails({ ...vehicleDetails, bodyType: text });
                markChanged();
              }}
              icon="square-outline"
            />
            <EditableField
              label="Mileage (km)"
              value={vehicleDetails.mileage.toString()}
              onChangeText={(text) => {
                setVehicleDetails({ ...vehicleDetails, mileage: parseInt(text) || 0 });
                markChanged();
              }}
              keyboardType="numeric"
              icon="speedometer-outline"
            />
            <EditableField
              label="Engine Size"
              value={vehicleDetails.engineSize}
              onChangeText={(text) => {
                setVehicleDetails({ ...vehicleDetails, engineSize: text });
                markChanged();
              }}
              icon="flash-outline"
            />
            <EditableField
              label="Transmission"
              value={vehicleDetails.transmission}
              onChangeText={(text) => {
                setVehicleDetails({ ...vehicleDetails, transmission: text as 'automatic' | 'manual' });
                markChanged();
              }}
              icon="settings-outline"
            />
            <EditableField
              label="Fuel Type"
              value={vehicleDetails.fuelType}
              onChangeText={(text) => {
                setVehicleDetails({ ...vehicleDetails, fuelType: text as 'petrol' | 'diesel' | 'hybrid' | 'electric' });
                markChanged();
              }}
              icon="flash-outline"
            />

            {/* Logbook Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <Ionicons name="book-outline" size={16} color={Colors.primary} />
                <Text variant="bodySmall">Service Logbook</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleButton, vehicleDetails.hasLogbook && styles.toggleButtonActive]}
                onPress={() => {
                  setVehicleDetails({ ...vehicleDetails, hasLogbook: !vehicleDetails.hasLogbook });
                  markChanged();
                }}
                activeOpacity={0.7}
              >
                <Text
                  variant="caption"
                  weight="semibold"
                  style={{ color: vehicleDetails.hasLogbook ? Colors.white : Colors.text }}
                >
                  {vehicleDetails.hasLogbook ? 'Yes' : 'No'}
                </Text>
              </TouchableOpacity>
            </View>
          </Accordion>

          <Spacer size="md" />

          {/* Condition Report Accordion */}
          <Accordion
            title="Condition Report"
            icon="clipboard-outline"
            defaultExpanded={false}
          >
            {/* Pros */}
            <View style={styles.conditionSection}>
              <View style={styles.conditionSectionHeader}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text variant="bodySmall" weight="semibold" style={{ color: Colors.success }}>
                  Pros
                </Text>
              </View>
              {conditionReport.pros.map((item) => (
                <ConditionItemRow
                  key={item.id}
                  item={item}
                  type="pros"
                  onRemove={() => handleRemoveConditionItem('pros', item.id)}
                  onUpdate={(desc) => handleUpdateConditionItem('pros', item.id, desc)}
                />
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddConditionItem('pros')}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={Colors.primary} />
                <Text variant="caption" style={{ color: Colors.primary }}>Add Pro</Text>
              </TouchableOpacity>
            </View>

            {/* Cons */}
            <View style={styles.conditionSection}>
              <View style={styles.conditionSectionHeader}>
                <Ionicons name="alert-circle" size={18} color={Colors.warning} />
                <Text variant="bodySmall" weight="semibold" style={{ color: Colors.warning }}>
                  Cons
                </Text>
              </View>
              {conditionReport.cons.map((item) => (
                <ConditionItemRow
                  key={item.id}
                  item={item}
                  type="cons"
                  onRemove={() => handleRemoveConditionItem('cons', item.id)}
                  onUpdate={(desc) => handleUpdateConditionItem('cons', item.id, desc)}
                />
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddConditionItem('cons')}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={Colors.primary} />
                <Text variant="caption" style={{ color: Colors.primary }}>Add Con</Text>
              </TouchableOpacity>
            </View>
          </Accordion>

          <Spacer size="md" />

          {/* Aftermarket Extras Accordion */}
          <Accordion
            title="Aftermarket Extras"
            icon="construct-outline"
            defaultExpanded={false}
          >
            {afterMarketExtras.map((extra) => (
              <ExtraItemRow
                key={extra.id}
                extra={extra}
                onRemove={() => handleRemoveExtra(extra.id)}
                onUpdate={(name) => handleUpdateExtra(extra.id, name)}
              />
            ))}
            {afterMarketExtras.length === 0 && (
              <Text variant="caption" color="textMuted" style={styles.noExtrasText}>
                No aftermarket extras added
              </Text>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddExtra}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color={Colors.primary} />
              <Text variant="caption" style={{ color: Colors.primary }}>Add Extra</Text>
            </TouchableOpacity>
          </Accordion>

          <Spacer size="md" />

          {/* Pricing & Location Accordion */}
          <Accordion
            title="Pricing & Location"
            icon="pricetag-outline"
            defaultExpanded={false}
          >
            {/* Asking Price Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceSectionHeader}>
                <Ionicons name="cash-outline" size={16} color={Colors.primary} />
                <Text variant="bodySmall" weight="semibold">Asking Price ($)</Text>
              </View>
              <Spacer size="sm" />
              <View style={styles.priceInputWrapper}>
                <View style={styles.priceInputIcon}>
                  <Text variant="body" weight="bold" style={{ color: Colors.primary }}>$</Text>
                </View>
                <TextInput
                  style={styles.priceTextInput}
                  placeholder="Enter asking price"
                  placeholderTextColor={Colors.textMuted}
                  value={pricing.askingPrice > 0 ? pricing.askingPrice.toLocaleString('en-AU') : ''}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setPricing({ ...pricing, askingPrice: parseInt(numericValue) || 0 });
                    markChanged();
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Spacer size="lg" />

            {/* Pickup Location Section */}
            <View style={styles.locationSectionHeader}>
              <Ionicons name="location-outline" size={16} color={Colors.secondary} />
              <Text variant="bodySmall" weight="semibold">Pickup Location</Text>
            </View>
            <Spacer size="sm" />

            <EditableField
              label="Street Address"
              value={pickupLocation.streetAddress}
              onChangeText={(text) => {
                setPickupLocation({ ...pickupLocation, streetAddress: text });
                markChanged();
              }}
              icon="location-outline"
            />
            <EditableField
              label="Suburb"
              value={pickupLocation.suburb}
              onChangeText={(text) => {
                setPickupLocation({ ...pickupLocation, suburb: text });
                markChanged();
              }}
              icon="business-outline"
            />
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <EditableField
                  label="State"
                  value={pickupLocation.state}
                  onChangeText={(text) => {
                    setPickupLocation({ ...pickupLocation, state: text });
                    markChanged();
                  }}
                />
              </View>
              <View style={styles.halfField}>
                <EditableField
                  label="Postcode"
                  value={pickupLocation.postcode}
                  onChangeText={(text) => {
                    setPickupLocation({ ...pickupLocation, postcode: text });
                    markChanged();
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </Accordion>

          <Spacer size="md" />

          {/* Write-Off Section */}
          <Accordion
            title="Write-Off Status"
            icon="warning-outline"
            defaultExpanded={false}
          >
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <Ionicons name="warning" size={16} color={Colors.warning} />
                <Text variant="bodySmall">Repairable Write-Off?</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleButton, writeOff.isWriteOff && styles.toggleButtonWarning]}
                onPress={() => {
                  setWriteOff({ ...writeOff, isWriteOff: !writeOff.isWriteOff });
                  markChanged();
                }}
                activeOpacity={0.7}
              >
                <Text
                  variant="caption"
                  weight="semibold"
                  style={{ color: writeOff.isWriteOff ? Colors.white : Colors.text }}
                >
                  {writeOff.isWriteOff ? 'Yes' : 'No'}
                </Text>
              </TouchableOpacity>
            </View>
            {writeOff.isWriteOff && (
              <EditableField
                label="Explanation"
                value={writeOff.explanation || ''}
                onChangeText={(text) => {
                  setWriteOff({ ...writeOff, explanation: text });
                  markChanged();
                }}
                placeholder="Explain the write-off history..."
                multiline
              />
            )}
          </Accordion>

          <Spacer size="xl" />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.accent} />
              <Text variant="bodySmall" weight="semibold" style={styles.deleteButtonText}>
                Delete Listing
              </Text>
            </TouchableOpacity>

            <Button
              onPress={handleSave}
              disabled={!hasChanges || isSaving}
              fullWidth
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </View>

          <Spacer size="3xl" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo Upload Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="body" weight="semibold">Add Photos</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Spacer size="lg" />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons name="camera" size={24} color={Colors.primary} />
              </View>
              <View style={styles.modalOptionText}>
                <Text variant="bodySmall" weight="semibold">Take Photo</Text>
                <Text variant="caption" color="textMuted">Use your camera</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons name="images" size={24} color={Colors.primary} />
              </View>
              <View style={styles.modalOptionText}>
                <Text variant="bodySmall" weight="semibold">Choose from Gallery</Text>
                <Text variant="caption" color="textMuted">Select multiple photos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            <Spacer size="md" />

            <Button variant="outline" onPress={() => setShowPhotoModal(false)} fullWidth>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerSpacer: {
    width: 44,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryTitle: {
    flex: 1,
    color: Colors.text,
  },
  summarySubtitle: {
    marginTop: Spacing.xs,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  lockedBadgeText: {
    color: Colors.textMuted,
  },
  lockedFieldsGrid: {
    gap: Spacing.sm,
  },

  // Locked Field
  lockedField: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },
  lockedFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  lockedFieldLabel: {
    color: Colors.textMuted,
    flex: 1,
  },
  lockIcon: {
    marginLeft: 'auto',
  },
  lockedFieldValue: {
    color: Colors.text,
  },

  // Section Card
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // Status Toggle
  statusToggleContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  statusToggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Editable Field
  editableField: {
    marginBottom: Spacing.md,
  },
  editableFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  editableFieldLabel: {
    color: Colors.textMuted,
  },
  editableFieldInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    minWidth: 50,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleButtonWarning: {
    backgroundColor: Colors.warning,
  },

  // Photos Grid
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoThumbnailContainer: {
    position: 'relative',
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryPhotoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  primaryPhotoText: {
    color: Colors.white,
    fontSize: 10,
  },
  noPhotosContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },

  // Condition Section
  conditionSection: {
    marginBottom: Spacing.lg,
  },
  conditionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  conditionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  conditionItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  conditionItemInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: Spacing.xs,
    minHeight: 60,
  },
  removeIconButton: {
    padding: Spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
  },

  // Extra Item
  extraItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  extraIconWrapper: {
    marginRight: Spacing.xs,
  },
  extraNameInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: Spacing.xs,
  },
  noExtrasText: {
    paddingVertical: Spacing.md,
    textAlign: 'center',
  },

  // Row Fields
  rowFields: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfField: {
    flex: 1,
  },

  // Action Buttons
  actionButtons: {
    gap: Spacing.md,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '10',
  },
  deleteButtonText: {
    color: Colors.accent,
  },

  // Add Photo Button
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },

  // Pricing Section
  priceSection: {
    marginBottom: Spacing.md,
  },
  priceSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  priceInputIcon: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '12',
  },
  priceTextInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
  locationSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  modalOptionText: {
    flex: 1,
  },
});
