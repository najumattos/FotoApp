import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAnamnese } from '../_layout';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [foto, setFoto] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');
  const [mostrarCamera, setMostrarCamera] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  
  // Pegamos a lista e a função do Contexto
  const { adicionarAnamnese, listaAnamnese } = useAnamnese();

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
      alert("Por favor, tire uma foto e preencha a descrição.");
      return;
    }

    const novoRegistro = {
      id: Date.now(),
      foto: foto,
      descricao: descricao
    };

    adicionarAnamnese(novoRegistro);
    alert("Registro salvo com sucesso!");
    
    // Limpa os campos para o próximo
    setFoto(null);
    setDescricao('');
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Nova Anamnese</Text>

        <TouchableOpacity style={styles.areaFoto} onPress={() => setMostrarCamera(true)}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.fotoPreview} />
          ) : (
            <Text style={styles.textoPlaceholder}>Clique para tirar a foto</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Descrição:</Text>
        <TextInput
          style={styles.input}
          placeholder="Descreva a observação..."
          multiline
          value={descricao}
          onChangeText={setDescricao}
        />

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarFormulario}>
          <Text style={styles.textoBotaoSalvar}>SALVAR REGISTRO</Text>
        </TouchableOpacity>

        {/* --- SEÇÃO DE HISTÓRICO ABAIXO DO BOTÃO --- */}
        <View style={styles.historicoContainer}>
          <Text style={styles.subtitulo}>Histórico Recente</Text>
          
          {listaAnamnese.length === 0 && (
            <Text style={styles.emptyText}>Nenhum registro ainda.</Text>
          )}

          {/* Renderização em lista usando .map (Melhor para dentro de ScrollView) */}
          {listaAnamnese.map((item) => (
            <View key={item.id} style={styles.cardHistorico}>
              <Image source={{ uri: item.foto }} style={styles.thumbHistorico} />
              <View style={styles.infoHistorico}>
                <Text style={styles.dataHistorico}>
                  {new Date(item.id).toLocaleTimeString('pt-BR')}
                </Text>
                <Text style={styles.descHistorico} numberOfLines={2}>
                  {item.descricao}
                </Text>
              </View>
            </View>
          )).reverse()} 
          {/* .reverse() para que o mais novo apareça no topo da lista embaixo do botão */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f5f5', flexGrow: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  areaFoto: {
    width: '100%', height: 200, backgroundColor: '#e0e0e0', borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden'
  },
  fotoPreview: { width: '100%', height: '100%' },
  textoPlaceholder: { color: '#666' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 16,
    borderWidth: 1, borderColor: '#ddd', marginBottom: 20, minHeight: 80, textAlignVertical: 'top'
  },
  botaoSalvar: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 10, alignItems: 'center' },
  textoBotaoSalvar: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Estilos do Histórico
  historicoContainer: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 20 },
  subtitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#444' },
  cardHistorico: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 10,
    borderRadius: 10, marginBottom: 10, elevation: 2, alignItems: 'center'
  },
  thumbHistorico: { width: 50, height: 50, borderRadius: 5 },
  infoHistorico: { marginLeft: 10, flex: 1 },
  dataHistorico: { fontSize: 10, color: '#888' },
  descHistorico: { fontSize: 14, color: '#333' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10 },

  cameraOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  btnCapture: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', borderWidth: 5, borderColor: '#ccc' },
  botaoSimples: { padding: 20, backgroundColor: '#ddd', borderRadius: 10 }
});