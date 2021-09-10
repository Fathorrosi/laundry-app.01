import "./customer.css";
import DataTable from "../../components/data-table/DataTable";
import { useState, useEffect } from "react";
import Axios from "axios";
import Swal from 'sweetalert2'

export default function Customer() {
    const [ListPaket, setListPaket] = useState([]);
    const [listSatuan, setListSatuan] = useState([]);
    const [listKiloan, setListKiloan] = useState([]);

    const [nama, setNama] = useState("");
    const [handphone, setHandphone] = useState("");
    const [jenis, setJenis] = useState("");
    const [berat, setBerat] = useState("");
    const [paket, setPaket] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [lama_cuci, setLamaCuci] = useState("");
    const [harga, setHarga] = useState("");
    const [diskon, setDiskon] = useState(0);
    const [jumlahPakaian, setJumlahPakaian] = useState(0);
    const [satuan, setSatuan] = useState('');

    useEffect(() => {
        Axios.get("http://localhost:3001/paket").then((response) => {
            setListPaket(response.data);
            let tempSatuan = [];
            let tempKiloan = [];

            for (let x of response.data) {
                if (x['flag'] === 2) {
                    tempSatuan.push(x);
                } else {
                    tempKiloan.push(x);
                }
            }
            setListSatuan(tempSatuan);
            setListKiloan(tempKiloan);

        });
    }, []);

    const getDetailPaket = async (event) => {
        setPaket(event.target.value);
        for (let index = 0; index < ListPaket.length; index++) {
            if (ListPaket[index].nama_paket === event.target.value) {
                setLamaCuci(ListPaket[index].lama_cuci);
                setHarga(ListPaket[index].harga);
                setDiskon(ListPaket[index].diskon);
            }
        }
    }

    const validateForm = () => {
        if (jenis === 'kiloan') {
            if (nama === '' || handphone === '' || jenis === '' ||
                berat === '' || paket === '' || keterangan === '' || jumlahPakaian === 0
            ) {
                return false
            } else {
                return true
            }
        } else {
            if (nama === '' || handphone === '' || jenis === '' ||
                jumlahPakaian === 0 || keterangan === '' || satuan === ''
            ) {
                return false
            } else {
                return true
            }
        }
    }

    const newTransaction = () => {
        Axios.post("http://localhost:3001/addTransaction", {
            nama: nama,
            handphone: handphone,
            jenis: jenis,
            berat: berat,
            paket: paket,
            keterangan: keterangan,
            lama_cuci: lama_cuci,
            harga: harga,
            diskon: diskon,
            jumlahPakaian: jumlahPakaian,
            jenisSatuan: satuan
        })
    }

    const addTransaction = async () => {
        await Swal.fire({
            title: 'Apakah kamu yakin?',
            text: "Transaksi baru akan ditambahkan.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Created!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                newTransaction();
                await Swal.fire({
                    icon: 'success',
                    title: 'Data berhasil ditambahkan!!',
                    showConfirmButton: false,
                    timer: 1000
                })
                await window.location.reload(false);
            }
        })
    };

    return (
        <div className="customer">
            <h2>Add Customer</h2>
            <div className="form-input">
                <div className="row">
                    <div className="col-10">
                        <label>Jenis Laundry</label>
                    </div>
                    <div className="col-25-2">
                        <select onChange={(event) => {
                            setJenis(event.target.value);
                        }}>
                            <option key={0}></option>)
                            <option value="kiloan">Kiloan</option>
                            <option value="satuan">Satuan</option>
                        </select>
                    </div>
                    <div className="col-10">
                        <label>Jumlah Pakaian</label>
                    </div>
                    <div className="col-25">
                        <input onChange={(event) => {
                            setJumlahPakaian(event.target.value);
                        }} type="number" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-10">
                        <label>Nama</label>
                    </div>
                    <div className="col-25">
                        <input onChange={(event) => {
                            setNama(event.target.value);
                        }} type="text" />
                    </div>
                    <div className="col-10">
                        <label>Paket Kiloan</label>
                    </div>
                    <div className="col-25-2">
                        <select onChange={(event) => {
                            getDetailPaket(event);
                        }} disabled={jenis === 'satuan'}>
                            <option key={0}></option>)
                            {
                                listKiloan.map((x) =>
                                    <option key={x.id} value={x.nama_paket}>{x.nama_paket}</option>)
                            }
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-10">
                        <label>Handphone</label>
                    </div>
                    <div className="col-25">
                        <input onChange={(event) => {
                            setHandphone(event.target.value);
                        }} type="number" />
                    </div>
                    <div className="col-10">
                        <label>Jenis Satuan</label>
                    </div>
                    <div className="col-25-2">
                        <select onChange={(event) => {
                            getDetailPaket(event);
                            setSatuan(event.target.value);
                        }} disabled={jenis === 'kiloan'}>
                            <option key={0}></option>)
                            {
                                listSatuan.map((x) =>
                                    <option key={x.id} value={x.nama_paket}>{x.nama_paket}</option>)
                            }
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-10">
                        <label>Berat (kg)</label>
                    </div>
                    <div className="col-25">
                        <input onChange={(event) => {
                            setBerat(event.target.value);
                        }} disabled={jenis === 'satuan'} type="number" />
                    </div>
                    <div className="col-10">
                        <label>Keterangan</label>
                    </div>
                    <div className="col-25">
                        <input onChange={(event) => {
                            setKeterangan(event.target.value);
                        }} type="text" />
                    </div>
                </div>
                <div className="row">
                    <input disabled={!validateForm()} onClick={addTransaction} type="submit" value="Submit" />
                </div>
            </div>
            <DataTable />
        </div>
    );
}
