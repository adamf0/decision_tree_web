import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiProduction } from '../Constant'
import TreeNode from './TreeNode';
import Select from 'react-select';

export default function PredictionPage() {
  const [formData, setFormData] = useState({
    NPM: '',
    IPK: '',
    Pendapatan: '',
    JumlahTanggungan: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(false);
  const [activeTab, setActiveTab] = useState("IPK");
  const [prediction, setPrediction] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [treeJson, setTree] = useState({});
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState(null);
  const [mahasiswaOptions, setMahasiswaOptions] = useState([]);
  
  const [mahasiswa, setMahasiswa] = useState([]);
  const [error2, setError2] = useState(null);
  const [loading2, setLoading2] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    layak: 0,
    tidakLayak: 0,
    TP: 0,
    TN: 0,
    FP: 0,
    FN: 0,
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1: 0,
  });


  useEffect(() => {
    // Dummy fetch, replace with actual fetch from your API
    const fetchMetrics = async () => {
      await apiProduction
        .get("/train-all-models")
        .then((response) => {
          setMetrics(response.data);
          console.log("Data fetched:", response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    const fetchListMahasiswa = async () => {
      setLoadingSelect(true);
      await apiProduction
        .get("/list-mahasiswa")
        .then((response) => {
          setMahasiswaOptions(response.data);
          setMahasiswa(response.data);
          setLoadingSelect(false);
          console.log("Data fetched:", response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setLoadingSelect(false);
        });
    };

    fetchListMahasiswa();
    fetchMetrics();
  }, []);

  const base64ToJson = (base64Str) => {
    try {
      const jsonString = atob(base64Str); // Decode base64 to string
      return JSON.parse(jsonString);      // Parse string to JSON object
    } catch (error) {
      console.error("Error decoding base64 JSON:", error);
      return {};
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await apiProduction.post('/visualize-tree-new', {
        NPM: `${formData.NPM}`,
      });
      setPrediction(response.data.prediction);
      setImageResult(response.data?.tree_image_base64 ?? null);
      setTree(base64ToJson(response.data?.tree_json_base64));
      setLoading(false);
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Terjadi kesalahan saat memproses prediksi.");
      setLoading(false);
    }
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    setError2(null);
    setLoading2(true);

    const fetchPredictionWithRetry = async (mhs, maxRetries = 3) => {
      // for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await apiProduction.post('/visualize-tree-newV2', {
            NPM: mhs.npm,
          });
          const prediksi = response.data.prediction=="Unknown"? "TIDAK LAYAK":response.data.prediction;

          const realita = mhs.keputusan?.toUpperCase?.() ?? "TIDAK LAYAK";
          let jenis = "-";
          if (prediksi === "LAYAK" && realita === "LAYAK") jenis = "TP";
          else if (prediksi === "TIDAK LAYAK" && realita === "TIDAK LAYAK") jenis = "TN";
          else if (prediksi === "LAYAK" && realita === "TIDAK LAYAK") jenis = "FP";
          else if (prediksi === "TIDAK LAYAK" && realita === "LAYAK") jenis = "FN";

          return { ...mhs, prediksi: prediksi, jenis };
        } catch (err) {
          throw err;
          // await new Promise((res) => setTimeout(res, 1000));
        }
      // }
    };

    try {
      const resultPromises = mahasiswa.map((m) => fetchPredictionWithRetry(m));
      const results = await Promise.all(resultPromises);

      const total = results.length;
      const layak = results.filter((r) => r.prediksi === "LAYAK").length;
      const tidakLayak = results.filter((r) => r.prediksi === "TIDAK LAYAK").length;

      const TP = results.filter((r) => r.jenis === "TP").length;
      const TN = results.filter((r) => r.jenis === "TN").length;
      const FP = results.filter((r) => r.jenis === "FP").length;
      const FN = results.filter((r) => r.jenis === "FN").length;

      const accuracy = total > 0 ? ((TP + TN) / total).toFixed(4) : 0;
      const recall = TP + FN > 0 ? (TP / (TP + FN)).toFixed(4) : 0;
      const precision = TP + FP > 0 ? (TP / (TP + FP)).toFixed(4) : 0;
      const f1 =
        parseFloat(precision) + parseFloat(recall) > 0
          ? (2 * (precision * recall) / (parseFloat(precision) + parseFloat(recall))).toFixed(4)
          : 0;

      const sortedResults = [...results].sort((a, b) => {
        if (a.prediksi === "LAYAK" && b.prediksi !== "LAYAK") return -1;
        if (a.prediksi !== "LAYAK" && b.prediksi === "LAYAK") return 1;
        return 0;
      });

      console.log({ sortedResults, total, layak, tidakLayak, TP, TN, FP, FN, accuracy, precision, recall, f1 })
      setSummary({ total, layak, tidakLayak, TP, TN, FP, FN, accuracy, precision, recall, f1 });
      setMahasiswa(sortedResults);
      setLoading2(false);
    } catch (err) {
      console.error("Prediction error:", err);
      setError2("Terjadi kesalahan saat memproses prediksi.");
      setLoading2(false);
    }
  };


  const chartData = metrics
  ? [
      {
        name: 'Model 1 (70:30)',
        accuracy: +(metrics.model_1_70_30.accuracy * 100).toFixed(1),
        recall: +(metrics.model_1_70_30.recall * 100).toFixed(1),
        f1_score: +(metrics.model_1_70_30.f1_score * 100).toFixed(1),
      },
      {
        name: 'Model 2 (80:20)',
        accuracy: +(metrics.model_2_80_20.accuracy * 100).toFixed(1),
        recall: +(metrics.model_2_80_20.recall * 100).toFixed(1),
        f1_score: +(metrics.model_2_80_20.f1_score * 100).toFixed(1),
      },
      {
        name: 'Model 3 (3-Fold)',
        accuracy: +(metrics.model_3_3fold.accuracy * 100).toFixed(1),
        recall: +(metrics.model_3_3fold.recall * 100).toFixed(1),
        f1_score: +(metrics.model_3_3fold.f1_score * 100).toFixed(1),
      },
      {
        name: 'Model 4 (5-Fold)',
        accuracy: +(metrics.model_4_5fold.accuracy * 100).toFixed(1),
        recall: +(metrics.model_4_5fold.recall * 100).toFixed(1),
        f1_score: +(metrics.model_4_5fold.f1_score * 100).toFixed(1),
      },
    ]
  : [];

  const tabData = {
    "IPK": [
      { kategori: "Rendah", rentang: "<3.00" },
      { kategori: "Sedang", rentang: "3.10 - 3.50" },
      { kategori: "Tinggi", rentang: ">3.50" },
    ],
    "Jumlah Tanggungan Keluarga": [
      { kategori: "Rendah", rentang: "1-2 orang" },
      { kategori: "Sedang", rentang: "3-4 orang" },
      { kategori: "Tinggi", rentang: ">=5 orang" },
    ],
    "Penghasilan Orang Tua": [
      { kategori: "Rendah", rentang: "<4.000.000" },
      { kategori: "Sedang", rentang: "4.000.001-6.000.000" },
      { kategori: "Tinggi", rentang: ">6.000.000" },
    ],
  };

  function renderRow(){
    if(loading2){
      return <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b" colSpan={8}>Sedang proses klasifikasi</td>
              </tr>;
    }
    if(error2){
      return <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b" colSpan={8}>ada masalah pada aplikasi, klik ulang Mulai Prediksi atau hubungi admin!</td>
              </tr>;
    }

    return mahasiswa.map((item,index) => {
                  let style = "";
                  if((index<=50 && item?.prediksi=="LAYAK")){
                    style = "bg-green-300";
                  } else if(index>50 || item?.prediksi=="TIDAK LAYAK"){
                    style = "bg-orange-300";
                  }
                  
                  return <tr key={item.id} className={style}>
                    <td className="px-4 py-2 border-b">{index+1}</td>
                    <td className="px-4 py-2 border-b">{item.npm}</td>
                    <td className="px-4 py-2 border-b">{item.nama}</td>
                    <td className="px-4 py-2 border-b">{item.ipk}</td>
                    <td className="px-4 py-2 border-b">{item.jumlahtanggungan}</td>
                    <td className="px-4 py-2 border-b">{item.pendapatan}</td>
                    <td className={`px-4 py-2 border-b ${item.keputusan=="LAYAK"? "text-green-600":"text-red-600"}`}>{item.keputusan}</td>
                    <td className={`px-4 py-2 border-b ${item?.prediksi=="LAYAK"? "text-green-600":"text-red-600"}`}>{item?.prediksi ?? ""}</td>
                  </tr>;
                });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Column */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Input Data</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium">Mahasiswa</label>
              {
                loadingSelect? 
                "sedang memuat data mahasiswa":
                <Select
                  name="Mahasiswa"
                  options={mahasiswaOptions}
                  value={mahasiswaOptions.find((opt) => opt.value === formData.NPM)}
                  onChange={(selected) => setFormData((prev) => ({ 
                    ...prev, 
                    NPM: selected?.value?.toString() || "",
                    IPK: selected?.ipk?.toString() || "",
                    Pendapatan: selected?.pendapatan?.toString() || "",
                    JumlahTanggungan: selected?.jumlahtanggungan?.toString() || "" ,
                  }))}
                  className="w-full"
                  classNamePrefix="select"
                  placeholder="Pilih Mahasiswa"
                />
              }
            </div>

            <div>
              <label className="block mb-1 font-medium">IPK</label>
              <input
                type="number"
                step="0.001"
                min="0"
                max="4"
                name="IPK"
                value={formData.IPK}
                onChange={handleChange}
                className="w-full p-2 border rounded-xl"
                disabled={true}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Pendapatan Keluarga</label>
              <input
                type="text"
                name="Pendapatan"
                value={formatRupiah(formData.Pendapatan)}
                onChange={handleChange}
                className="w-full p-2 border rounded-xl"
                disabled={true}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Jumlah Tanggungan Keluarga</label>
              <input
                type="number"
                name="JumlahTanggungan"
                value={formData.JumlahTanggungan}
                onChange={handleChange}
                className="w-full p-2 border rounded-xl"
                disabled={true}
              />
            </div>

            {
              loading? 
                "Sedang memuat hasil":
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                >
                  Submit
                </button>
            }

            {prediction && (
              <p className="mt-2 text-green-600 font-medium">Hasil Prediksi: {prediction=="Unknown"? "Tidak Layak":prediction}</p>
            )}
            {error && (
              <p className="mt-2 text-red-600 font-medium">{error}</p>
            )}
          </form>
        </div>

        {/* Chart Column */}
        <div className="bg-white rounded-2xl shadow p-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b mb-4">
            {Object.keys(tabData).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-blue-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border-b">Kategori</th>
                  <th className="px-4 py-2 border-b">Rentang</th>
                </tr>
              </thead>
              <tbody>
                {tabData[activeTab].map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{item.kategori}</td>
                    <td className="px-4 py-2 border-b">{item.rentang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* <div className="bg-white rounded-2xl shadow p-6"> */}
          {/* <h2 className="text-xl font-semibold mb-2">Model Evaluation</h2>
          {metrics && (
            <p className="mb-4 text-sm text-gray-600">
              Total Dataset: <span className="font-bold">{metrics?.total_dataset ?? 0} data</span>
            </p>
          )}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#2563eb" name="Accuracy" />
                <Bar dataKey="recall" fill="#10b981" name="Recall" />
                <Bar dataKey="f1_score" fill="#f59e0b" name="F1 Score" />
              </BarChart>
            </ResponsiveContainer>
          </div> */}
        {/* </div> */}

        {prediction && (
          <>
          <div className="bg-white rounded-2xl shadow p-6">
            <img src={`data:image/png;base64,${imageResult}`} alt="" />
          </div>

          {treeJson && (
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="bg-white rounded-2xl shadow p-6 overflow-auto max-h-[600px]">
                  <h2 className="text-xl font-semibold mb-4">Visualisasi Pohon Keputusan</h2>
                  <TreeNode node={treeJson} />
                </div>
              </div>
          )}
          </>
        )}

        <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700" onClick={handleSubmit2}>Mulai Prediksi</button>
            <div className="mt-4 p-4 rounded-xl bg-gray-50 shadow-inner text-sm space-y-2">
              <p className="font-semibold">📊 Ringkasan Hasil Prediksi:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4">
                <p>Total Data: <span className="font-medium">{summary.total}</span></p>
                <p>Total LAYAK: <span className="text-green-600 font-medium">{summary.layak}</span></p>
                <p>Total TIDAK LAYAK: <span className="text-red-600 font-medium">{summary.tidakLayak}</span></p>
                <p>True Positive (TP): <span className="font-medium">{summary.TP}</span></p>
                <p>True Negative (TN): <span className="font-medium">{summary.TN}</span></p>
                <p>False Positive (FP): <span className="text-red-600 font-medium">{summary.FP}</span></p>
                <p>False Negative (FN): <span className="text-red-600 font-medium">{summary.FN}</span></p>
                <p>🎯 Accuracy: <span className="font-medium">{summary.accuracy*100} %</span></p>
                <p>📈 Precision: <span className="font-medium">{summary.precision*100} %</span></p>
                <p>🔁 Recall: <span className="font-medium">{summary.recall*100} %</span></p>
                <p>📊 F1 Score: <span className="font-medium">{summary.f1*100} %</span></p>
              </div>
            </div>
            <table className="min-w-full table-auto border-collapse mt-4">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border-b">No</th>
                  <th className="px-4 py-2 border-b">NPM</th>
                  <th className="px-4 py-2 border-b">NAMA</th>
                  <th className="px-4 py-2 border-b">IPK</th>
                  <th className="px-4 py-2 border-b">Jumlah Tanggungan</th>
                  <th className="px-4 py-2 border-b">Pendapatan Ortu</th>
                  <th className="px-4 py-2 border-b">Status Penerimaan</th>
                  <th className="px-4 py-2 border-b">Prediksi</th>
                </tr>
              </thead>
              <tbody>
                {renderRow()}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}