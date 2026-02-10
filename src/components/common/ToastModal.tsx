import React from 'react';
import { Modal, View, StyleProp, ViewStyle } from 'react-native';
import Toast, { ToastMessage } from './Toast';

interface ToastModalProps {
  visible: boolean;
  toasts: ToastMessage[];
  onClose: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

const ToastModal: React.FC<ToastModalProps> = ({ visible, toasts, onClose, style }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={() => {}}>
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'flex-end',
            pointerEvents: 'box-none',
            paddingBottom: 40,
          },
          style,
        ]}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            heading={toast.heading}
            message={toast.message}
            onClose={onClose}
          />
        ))}
      </View>
    </Modal>
  );
};

export default ToastModal;
