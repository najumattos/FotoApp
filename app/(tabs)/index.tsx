import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';


export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
 const [foto, setFoto] = useState<string | null>(null);
 
  // Isso diz ao TypeScript que a referência é para um componente CameraView
const cameraRef = useRef<CameraView>(null);

  // 1. Verificação de Permissão
  if (!permission) return <View />;
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>Precisamos da sua permissão para abrir a câmera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Função para tirar a foto
  async function tirarFoto() {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
    const data = await cameraRef.current.takePictureAsync(options);
if (data && data.uri) {
  setFoto(data.uri);
}
    }
  }

  return (
    <View style={styles.container}>
      {foto ? (
        <View style={styles.preview}>
          <Image source={{ uri: foto }} style={styles.image} />
          <TouchableOpacity onPress={() => setFoto(null)} style={styles.button}>
            <Text style={styles.text}>Tirar Outra</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={tirarFoto}>
              <Text style={styles.text}>Tirar Foto</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  camera: { flex: 1 },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 64,
  },
  captureButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 50
  },
  preview: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '80%', height: '70%', borderRadius: 10 },
  text: { fontSize: 18, fontWeight: 'bold', color: 'black' },
  button: { marginTop: 20, backgroundColor: '#ddd', padding: 10 }
});