import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker'; 
import { useAnamnese } from '../_layout'; // Verifique se o caminho está correto
import * as Notifications from 'expo-notifications';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [foto, setFoto] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');
  const [mostrarCamera, setMostrarCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { adicionarAnamnese, listaAnamnese } = useAnamnese();

  async function agendarNotificacao() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hora de continuar! 🚀",
        body: "Volte para o Expo para registrar mais anamneses.",
        data: { screen: 'Explore' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1 * 60, 
      },
    });
  }

  async function escolherDaGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return alert("Sem permissão!");

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!resultado.canceled) setFoto(resultado.assets[0].uri);
  }

  async function tirarFoto() {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync();
      if (data) {
        setFoto(data.uri);
        setMostrarCamera(false);
      }
    }
  }

  function salvarFormulario() {
    if (!foto || !descricao) {
      alert("Preencha a foto e a descrição!");
      return;
    }
    adicionarAnamnese({ id: Date.now(), foto, descricao });
    agendarNotificacao();
    setFoto(null);
    setDescricao('');
    alert("Salvo com sucesso!");
  }

  if (!permission?.granted) {
    return (
      <View style={styles.centered}>
        <TouchableOpacity style={styles.botaoSimples} onPress={requestPermission}>
          <Text>Ativar Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mostrarCamera) {
    return (
      <CameraView style={{ flex: 1 }} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.btnCapture} onPress={tirarFoto} />
        </View>
      </CameraView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Nova Anamnese</Text>
        
        <View style={styles.areaFoto}>
          {foto ? (
            <>
              <Image source={{ uri: foto }} style={styles.fotoPreview} />
              <TouchableOpacity style={styles.botaoRemover} onPress={() => setFoto(null)}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text >Nenhuma foto selecionada</Text>
          )}
        </View>

        <View style={styles.rowBotoes}>
          <TouchableOpacity style={styles.btnAcao} onPress={() => setMostrarCamera(true)}>
            <Text style={styles.btnAcaoTexto}>📷 Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAcao, styles.btnGaleria]} onPress={escolherDaGaleria}>
            <Text style={styles.btnAcaoTexto}>🖼️ Galeria</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Descrição"
          multiline
          value={descricao}
          onChangeText={setDescricao}
        />

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarFormulario}>
          <Text style={styles.textoBotaoSalvar}>SALVAR REGISTRO</Text>
        </TouchableOpacity>

        <View style={styles.historicoContainer}>
          <Text style={styles.subtitulo}>Histórico</Text>
          {[...listaAnamnese].reverse().map((item) => (
            <View key={item.id} style={styles.cardHistorico}>
              <Image source={{ uri: item.foto }} style={styles.thumbHistorico} />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontSize: 10 }}>{new Date(item.id).toLocaleTimeString()}</Text>
                <Text>{item.descricao}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  areaFoto: { width: '100%', height: 200, backgroundColor: '#ddd', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  fotoPreview: { width: '100%', height: '100%', borderRadius: 10 },
  botaoRemover: { position: 'absolute', top: 5, right: 5, backgroundColor: 'red', width: 25, height: 25, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowBotoes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  btnAcao: { flex: 0.48, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnGaleria: { backgroundColor: '#5856D6' },
  btnAcaoTexto: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, minHeight: 60 },
  botaoSalvar: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 10, alignItems: 'center' },
  textoBotaoSalvar: { color: '#fff', fontWeight: 'bold' },
  historicoContainer: { marginTop: 30 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  cardHistorico: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 },
  thumbHistorico: { width: 40, height: 40, borderRadius: 4 },
  cameraOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  btnCapture: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff' },
  botaoSimples: { padding: 15, backgroundColor: '#007AFF', borderRadius: 10 }
});