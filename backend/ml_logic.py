import pandas as pd
import math
import json
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, recall_score, f1_score, classification_report
from graphviz import Digraph
import base64

def encode_data(df):
    label_encoders = {}
    for col in ['IPK', 'Pendapatan', 'JumlahTanggungan', 'Keputusan']:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le
    return df, label_encoders

def model_split(df, test_size=0.3, random_state=1):
    X = df[['IPK', 'Pendapatan', 'JumlahTanggungan']]
    y = df['Keputusan']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)
    clf = DecisionTreeClassifier()
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    return {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred, pos_label=1), 4),
        "f1_score": round(f1_score(y_test, y_pred, pos_label=1), 4),
        # "report": classification_report(y_test, y_pred, target_names=['tidak', 'ya'], output_dict=True)
    }

def model_kfold(df, k=3, random_state=1, positive_label=1):
    X = df[['IPK', 'Pendapatan', 'JumlahTanggungan']]
    y = df['Keputusan']
    skf = StratifiedKFold(n_splits=k, shuffle=True, random_state=random_state)

    metrics = {"accuracy": [], "recall": [], "f1_score": []}
    best_model = None
    best_f1 = 0
    for train_idx, test_idx in skf.split(X, y):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
        clf = DecisionTreeClassifier()
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred, pos_label=positive_label)
        f1 = f1_score(y_test, y_pred, pos_label=positive_label)
        metrics['accuracy'].append(acc)
        metrics['recall'].append(rec)
        metrics['f1_score'].append(f1)
        if f1 > best_f1:
            best_f1 = f1
            best_model = clf

    return {
        "accuracy": round(sum(metrics['accuracy']) / k, 4),
        "recall": round(sum(metrics['recall']) / k, 4),
        "f1_score": round(sum(metrics['f1_score']) / k, 4)
    }

def train_all_models(data):
    df = pd.DataFrame(data)
    df, label_encoders = encode_data(df)
    positive_label = label_encoders['Keputusan'].transform(['LAYAK'])[0]

    model1 = model_split(df, test_size=0.3)
    model2 = model_split(df, test_size=0.2)
    model3 = model_kfold(df, k=3, positive_label=positive_label)
    model4 = model_kfold(df, k=5, positive_label=positive_label)

    return {
        "total_dataset": len(data),
        "model_1_70_30": model1,
        "model_2_80_20": model2,
        "model_3_3fold": model3,
        "model_4_5fold": model4
    }

# ========== Manual Tree ==========
# ========================================
# HITUNG ENTROPY
# Rumus: H(S) = -∑pᵢ log₂(pᵢ)
# ========================================
def entropy(data, target_attr):
    freq = {}
    for row in data:
        label = row[target_attr]
        freq[label] = freq.get(label, 0) + 1

    total = len(data)
    ent = 0.0
    for count in freq.values():
        p = count / total
        ent -= p * math.log2(p)
    return round(ent, 4)

# ========================================
# MAJORITY CLASS
# Jika tidak bisa split, ambil label terbanyak
# ========================================
def majority_class(data, target_attr):
    counts = {}
    for row in data:
        label = row[target_attr]
        counts[label] = counts.get(label, 0) + 1
    return max(counts, key=counts.get)

# ========================================
# MEMBANGUN POHON KEPUTUSAN DENGAN ENTROPY & GAIN
# Gain = Entropy(parent) - ∑(proporsi * Entropy(cabang))
# ========================================
def build_tree(data, attributes, target_attr):
    labels = [row[target_attr] for row in data]

    # Jika semua label sama, return label tsb (leaf node)
    if labels.count(labels[0]) == len(labels):
        return labels[0]

    # Jika tidak ada atribut tersisa, kembalikan majority class
    if not attributes:
        return majority_class(data, target_attr)

    # Fungsi hitung information gain
    def info_gain(data, attr):
        values = {}
        for row in data:
            key = row[attr]
            values.setdefault(key, []).append(row)

        subset_entropy = 0.0
        for subset in values.values():
            weight = len(subset) / len(data)
            subset_entropy += weight * entropy(subset, target_attr)

        return entropy(data, target_attr) - subset_entropy

    # Pilih atribut terbaik (gain tertinggi)
    best_attr = max(attributes, key=lambda attr: info_gain(data, attr))

    total_entropy = entropy(data, target_attr)  # Menghitung total entropy dari dataset terhadap target_attr menggunakan rumus:
                                            # Entropy(S) = -Σ (p_i * log2(p_i)) untuk setiap kelas i dalam target_attr,
                                            # di mana p_i adalah proporsi jumlah data dengan kelas ke-i terhadap total data.

    tree = {
        'attribute': best_attr,
        'branches': {}
    }

    # Untuk setiap nilai dari atribut terbaik
    attr_values = set(row[best_attr] for row in data)
    for val in attr_values:
        subset = [row for row in data if row[best_attr] == val]
        subset_entropy = entropy(subset, target_attr)
        subset_gain = total_entropy - (len(subset) / len(data)) * subset_entropy

        if not subset:
            tree['branches'][val] = {
                'entropy': 0.0,
                'gain': 0.0,
                'node': majority_class(data, target_attr)
            }
        else:
            remaining_attrs = [a for a in attributes if a != best_attr]
            subtree = build_tree(subset, remaining_attrs, target_attr)
            tree['branches'][val] = {
                'entropy': round(subset_entropy, 4),
                'gain': round(subset_gain, 4),
                'node': subtree
            }

    return tree

# ========================================
# VISUALISASI POHON DENGAN ENTROPY & GAIN
# Menggunakan Graphviz
# ========================================
def visualize_tree(tree, output='tree_visual'):
    dot = Digraph()
    visited_edges = set()

    def add_nodes_edges(node, parent=None, label=None):
        node_id = str(id(node))

        if isinstance(node, str):
            # Node daun (keputusan)
            dot.node(node_id, label=node, shape='box', style='filled', color='lightgreen')
        else:
            # Node atribut
            dot.node(node_id, label=node['attribute'], shape='ellipse', style='filled', color='lightblue')

            for val, branch in node['branches'].items():
                child = branch['node']
                child_id = str(id(child))
                add_nodes_edges(child, node_id, val)

                # Tampilkan label edge = nilai atribut
                edge_key = (node_id, child_id, val)
                if edge_key not in visited_edges:
                    visited_edges.add(edge_key)
                    dot.edge(
                        node_id, child_id,
                        label=f"{val}\nGain={branch['gain']}, \nEntropy={branch['entropy']}"
                    )

    add_nodes_edges(tree)
    file_path = dot.render(output, format='png', cleanup=True)

    with open(file_path, 'rb') as f:
        png_bytes = f.read()
        
    image_base64 = base64.b64encode(png_bytes).decode('utf-8')
    return image_base64

# ========================================
# FUNGSI PREDIKSI UNTUK INSTANSI BARU
# ========================================
def predict(tree, instance):
    if isinstance(tree, str):
        return tree

    attr = tree['attribute']
    val = instance.get(attr)
    branch = tree['branches'].get(val)

    if branch is None:
        return "Unknown"

    return predict(branch['node'], instance)

def build_decision_tree(data, new_instance, attributes, target):
    tree = build_tree(data, attributes, target)

    return {
        "new_instance":new_instance,
        "prediction": predict(tree, new_instance),
        "tree_json_base64": base64.b64encode(json.dumps(tree).encode('utf-8')).decode('utf-8'),
        "tree_image_base64": visualize_tree(tree, 'decision_tree_with_gain')
    }

def build_decision_treeV2(data, new_instance, attributes, target):
    tree = build_tree(data, attributes, target)

    return {
        "new_instance":new_instance,
        "prediction": predict(tree, new_instance),
    }