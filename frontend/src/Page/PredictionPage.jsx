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
  const [activeTab, setActiveTab] = useState("IPK");
  const [prediction, setPrediction] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [treeJson, setTree] = useState({});
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState(null);
  const [mahasiswaOptions, setMahasiswaOptions] = useState([]);

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
      await apiProduction
        .get("/list-mahasiswa")
        .then((response) => {
          setMahasiswaOptions(response.data);
          console.log("Data fetched:", response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Column */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Input Data</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium">Mahasiswa</label>
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

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            >
              Submit
            </button>
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
      </div>
    </div>
  );
}