import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  TextInput, SafeAreaView, StatusBar, Alert 
} from 'react-native';
// 這裡改用手機專用的儲存套件
import AsyncStorage from '@react-native-async-storage/async-storage';
// 這裡改用手機專用的圖示套件
import { Plus, RotateCcw, CheckCircle2, Circle, Trash2 } from 'lucide-react-native';

const APP_STORAGE_KEY = '2026_planner_data';

const FIXED_REVIEW_ITEMS = [
  '育膚堂帳單', '賣貨便帳款', '蝦皮帳款R', '蝦皮帳款U',
  '廠商帳單', '他牌帳單', '台幣帳單', '內地帳單', '簽約帳單'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('daily');
  const [data, setData] = useState({
    daily: [],
    monthly: [],
    review: FIXED_REVIEW_ITEMS.map((text, idx) => ({ id: `fixed-${idx}`, text, completed: false, timestamp: Date.now() })),
    yearly: []
  });

  const tabs = [
    { id: 'daily', label: '每日待辦' },
    { id: 'monthly', label: '每月計畫' },
    { id: 'review', label: '每月固定' },
    { id: 'yearly', label: '每年總計' }
  ];

  // 讀取手機本地存檔
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(APP_STORAGE_KEY);
        if (savedData) setData(JSON.parse(savedData));
      } catch (e) {
        console.error("載入失敗", e);
      }
    };
    loadData();
  }, []);

  // 儲存資料到手機
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("儲存失敗", e);
      }
    };
    saveData();
  }, [data]);

  const addItem = (tabId) => {
    const newItem = {
      id: Math.random().toString(36).substring(7),
      text: '',
      completed: false,
      timestamp: Date.now()
    };
    setData(prev => ({ ...prev, [tabId]: [newItem, ...prev[tabId]] }));
  };

  const toggleItem = (tabId, itemId) => {
    setData(prev => ({
      ...prev,
      [tabId]: prev[tabId].map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const updateText = (tabId, itemId, text) => {
    setData(prev => ({
      ...prev,
      [tabId]: prev[tabId].map(item => item.id === itemId ? { ...item, text } : item)
    }));
  };

  const deleteItem = (tabId, itemId) => {
    setData(prev => ({
      ...prev,
      [tabId]: prev[tabId].filter(item => item.id !== itemId)
    }));