import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Button, Text, View, SafeAreaView, Platform, TextInput, TouchableHighlight, Image, ScrollView } from 'react-native';

export default function App() {
  const inputRef = useRef(null)
  const [value, setValue] = useState('')
  const [equals, setEquals] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const buttons = ['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '=']

  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.focus()
    }

    const getHistory = async () => {
      try {
        const results = JSON.parse(await AsyncStorage.getItem('historyItem')) || []
        setHistory(results)

      }catch(error) {
        console.log(error)
      }
      
    }
    getHistory()
  })

  const handlePressHistory = () => {
    setShowHistory(history => !history)
  }
  const handlePressDelete = () => {
    setValue(value => value.slice(0, -1))
  }

  const handleDeleteHistory = async () => {
    await AsyncStorage.removeItem('historyItem')
  }

  const handlePressDigit = (b) => {

    if(Number.isNaN(Number.parseInt(b)) === false) {
      const v = value.at(-1)
      if((v !== '+' && v!=='-'&&v!=='*'&&v!=='/'&&v!=='%'&&v!=='.') && equals === true) {
        setValue('')
        setEquals(false)
        
      }
      setValue(value => value + b)
    }
    else if(Number.isNaN(Number.parseInt(b)) === true) {
      if(b === 'C') {
        setValue('')
      } else if(b === '=') {

        setEquals(true)
          try {
            const result = eval(value)
            setValue(result.toFixed(2).toString())

            const setHist = async (val, res) => {
              try {
                const anotherHistory = [...history, [val, res.toFixed(2).toString()]]
                await AsyncStorage.setItem('historyItem', JSON.stringify(anotherHistory))
              }catch(error) {
                console.log(error)
              }
            }
            setHist(value, result)
          }catch(err) {
            setValue('error')
          }
      }else if(Number.isNaN(Number.parseInt(value.at(-1))) === true && (b !== ')' && b !== '(' && value.at(-1) !== '(' && value.at(-1) !== ')')) {
        setValue(value => value.slice(0, -1).concat(b))
      } else {
        setValue(value => value + b)
      }

    }
    
  }

  return (
    <>
    <StatusBar style="auto" />
    <SafeAreaView style={styles.container}>
      <View style = {styles.screen}>
        <TextInput ref={inputRef} value={value} showSoftInputOnFocus={false} style = {styles.inputScreen} />
      </View>
      <View style = {styles.bar}>
        <TouchableHighlight style = {styles.backspace} underlayColor= "#E5E4E2" activeOpacity={0.6} onPress={handlePressHistory}>
          <Image style = {{width:20, height: 20, objectFit: 'contain'}} source={ !showHistory ? require(`./assets/clock.png`) : require(`./assets/calculator.png`)} />
        </TouchableHighlight> 

      {
        showHistory &&
        <TouchableHighlight style = {styles.backspace} underlayColor= "#E5E4E2" activeOpacity={0.6} onPress={handleDeleteHistory}>
          <Text style = {{ fontWeight: 700, color: 'red', fontSize: 16 }} >CLEAR</Text>
        </TouchableHighlight> 
      }

        <TouchableHighlight style = {styles.backspace} underlayColor= "#E5E4E2" activeOpacity={0.6} onPress={handlePressDelete}>
          <Image style = {{width:30, height: 20, objectFit: 'contain'}} source={require('./assets/delete.png')} />
        </TouchableHighlight>
      </View>
      <View style = {styles.btns}>
        { !showHistory &&
          buttons.map(button => (
            <TouchableHighlight key={button} onPress={() => handlePressDigit(button)} underlayColor={'#848482'} activeOpacity={0.6} style = {{ height : 70, width: 70, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5E4E2', borderRadius: '50%', }}>
              <Text style = {{ fontSize: 22, fontWeight: 600 }} >{button}</Text>
            </TouchableHighlight>
          ))
        }
        {
          showHistory &&
          <ScrollView style = {styles.scrollContent} >
            {
              history.reverse().map((item, index) => (
                <View key={index} style = {styles.historyItem}>
                  <Text style = {{ fontWeight: 500, fontSize: 25}}>{item[0]}</Text>
                  <Text style = {{ fontWeight: 800, fontSize: 27, color: 'green' }}>{item[1]}</Text>
                </View>
              ))
            }
          </ScrollView>
        }

      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: 'gray'
  },
  screen : {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputScreen : {
    height: 100,
    width: '90%',
    fontSize: 40,
    textAlign: 'right'
  },
  bar : {
    flex: 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  backspace : {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
  },
  btns : {
    flex: 0.55,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    padding: 10
  },
  scrollContent: {
    height: '100%',
  },
  historyItem : {
    borderBottomColor: 'green',
    borderBottomWidth: 1,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15
  }
});
