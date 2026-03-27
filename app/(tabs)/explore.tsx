import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAnamnese } from '../_layout';

export default function AnamneseScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mostrarCamera, setMostrarCamera] = useState(false);
  const cameraRef = React.useRef<CameraView>(null);
  
  // Usando o contexto global e a função de adicionar
  const { listaAnamnese, adicionarAnamnese } = useAnamnese();

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={requestPermission} style={styles.botao}>
          <Text>Liberar Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function tirarFoto() {
    if (cameraRef.current) {
      const foto = await cameraRef.current.takePictureAsync();
      if (foto) {
        // Criando um registro rápido sem descrição apenas para teste via botão +
        const novo = {
          id: Date.now(),
          foto: foto.uri,
          descricao: "Captura rápida da galeria"
        };
        adicionarAnamnese(novo);
        setMostrarCamera(false);
      }
    }
  }

  if (mostrarCamera) {
    return (
      <CameraView style={{ flex: 1 }} ref={cameraRef}>
        <View style={styles.overlayCamera}>
          <TouchableOpacity style={styles.botaoCaptura} onPress={tirarFoto}>
            <Text style={{ fontWeight: 'bold' }}>TIRAR</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico de Anamnese</Text>

      <FlatList
        data={listaAnamnese}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }} // Espaço para não cobrir o último item com o botão
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.foto }} style={styles.thumb} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardData}>{new Date(item.id).toLocaleDateString('pt-BR')}</Text>
              <Text style={styles.cardDescricao} numberOfLines={3}>{item.descricao}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
        }
      />

      <TouchableOpacity style={styles.botaoFlutuante} onPress={() => setMostrarCamera(true)}>
        <Text style={styles.textoBotao}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 50 },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  
  // Estilos dos Cards
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 12,
    padding: 10,
    // Sombra para Android e iOS
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee'
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center'
  },
  cardData: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4
  },
  cardDescricao: {
    fontSize: 15,
    color: '#444',
    lineHeight: 20
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16
  },

  // Botões e Câmera
  botaoFlutuante: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#2e7d32', // Cor combinando com o botão salvar
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  textoBotao: { color: 'white', fontSize: 35, fontWeight: '300' },
  overlayCamera: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 40 },
  botaoCaptura: { width: 75, height: 75, borderRadius: 40, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  botao: { backgroundColor: '#ddd', padding: 20, margin: 50, alignItems: 'center', borderRadius: 10 }
});