import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface CoffeeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<CoffeeModalProps> = ({
  visible,
  onClose,
}) => {
  const handleBuyCoffee = async () => {
    try {
      // You can replace this with your actual Ko-fi, PayPal, or other donation link
      const coffeeUrl = "https://ko-fi.com/iamtope"; // Replace with your actual Ko-fi, PayPal, or other donation link
      const supported = await Linking.canOpenURL(coffeeUrl);
      if (supported) {
        await Linking.openURL(coffeeUrl);
      }
    } catch (error) {
      console.log("Error opening coffee link:", error);
    }
    onClose();
  };

  const features = [
    {
      icon: "heart-outline",
      title: "Support Development",
      description: "Help keep this app free and improve it",
    },
    {
      icon: "cafe-outline",
      title: "Buy Me Coffee",
      description: "Fuel my coding sessions with caffeine",
    },
    {
      icon: "star-outline",
      title: "Show Appreciation",
      description: "Let me know you find this app useful",
    },
    {
      icon: "rocket-outline",
      title: "Enable Future Updates",
      description: "Help fund new features and improvements",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="cafe-outline" size={32} color="#FF6B35" />
              <View style={styles.titleRow}>
                <Text style={styles.title}>Buy Me Coffee</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close-outline" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.subtitle}>
                Support the development of this app
              </Text>
            </View>
          </View>

          {/* Features */}
          <ScrollView
            style={styles.featuresContainer}
            showsVerticalScrollIndicator={false}
          >
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color="#FF6B35"
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Suggested donation</Text>
              <Text style={styles.price}>$5</Text>
              <Text style={styles.priceSubtext}>
                Any amount is appreciated!
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handleBuyCoffee}
            >
              <Ionicons name="cafe-outline" size={20} color="#FFF" />
              <Text style={styles.purchaseButtonText}>Buy Me Coffee</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.restoreButton} onPress={onClose}>
              <Ionicons name="heart-outline" size={16} color="#FF6B35" />
              <Text style={styles.restoreButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}></View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.6,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "#2A2A2A",
  },
  headerContent: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 12,
  },
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    color: "#CCC",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  featuresContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    color: "#CCC",
    fontSize: 14,
    lineHeight: 20,
  },
  pricingContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#2A2A2A",
  },
  priceBox: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 53, 0.3)",
  },
  priceLabel: {
    color: "#CCC",
    fontSize: 14,
    marginBottom: 8,
  },
  price: {
    color: "#FF6B35",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  priceSubtext: {
    color: "#CCC",
    fontSize: 12,
  },

  purchaseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  purchaseButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  restoreButtonText: {
    color: "#FF6B35",
    fontSize: 14,
    marginLeft: 6,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 5,
    paddingBottom: 6,
    gap: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "center",
  },
  footerText: {
    color: "#CCC",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 18,
  },
});
