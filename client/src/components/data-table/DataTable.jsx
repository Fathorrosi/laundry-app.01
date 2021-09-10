import "./dataTable.css";
import { DataGrid } from "@material-ui/data-grid";
import { useState, useEffect } from "react";
import Axios from "axios";
import Swal from 'sweetalert2'

export default function DataTable(props) {
    const [data, setData] = useState([]);

    useEffect(() => {
        Axios.get("http://localhost:3001/transactions").then((response) => {
            setData(response.data);
        });
    }, [])

    const updateTransaction = (id, nama, handphone, tgl_masuk) => {
        Axios.put("http://localhost:3001/update",
            { id: id, nama: nama, handphone: handphone, tgl_masuk: tgl_masuk });
    };

    const formatter = (value) => {
        return (value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    const updateStatus = (status, id, nama, handphone, tgl_masuk) => {
        Swal.fire({
            title: 'Apakah kamu yakin?',
            text: "Status akan menjadi " + setStatus(status),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Update!'
        }).then((result) => {
            if (result.isConfirmed) {
                updateTransaction(id, nama, handphone, tgl_masuk);
                Swal.fire({
                    icon: 'success',
                    title: 'Status berhasil diupdate!!',
                    showConfirmButton: false,
                    timer: 1000
                })
                setTimeout(() => {
                    window.location.reload(false);
                }, 1500);
            }
        })
    }

    const setStatus = (status) => {
        if (status === 'Proses') { return 'Selesai' }
        if (status === 'Selesai') { return 'Selesai' }
    }

    const columns = [
        { field: "id", headerName: "ID" },
        {
            field: "nama",
            headerName: "Nama",
            width: 130,
        },
        {
            field: "handphone",
            headerName: "Handphone",
            width: 160,
        },
        {
            field: "berat",
            headerName: "Berat",
            width: 160,
            hide: props.isDashboard,
        },
        {
            field: "jumlah_pakaian",
            headerName: "Jumlah Pakaian",
            width: 160,
            hide: props.isDashboard,
        },
        {
            field: "jenis_satuan",
            headerName: "Jenis Satuan",
            width: 160,
            hide: props.isDashboard,
        },
        {
            field: "paket",
            headerName: "Paket",
            width: 160,
            hide: props.isDashboard,
        },
        {
            field: "jenis",
            headerName: "Kategori",
            width: 130,
        },
        {
            field: "harga",
            headerName: "Tagihan",
            width: 160,
            valueFormatter: (params) => {
                return 'Rp. ' + formatter(params.value);
            },
        },
        {
            field: "tgl_masuk",
            headerName: "Tgl Masuk",
            width: 160,
            hide: props.isDashboard,
            valueFormatter: (params) => {
                var date = new Date(params.value)
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
            },
        },
        {
            field: "tgl_selesai",
            headerName: "Estimasi selesai",
            width: 180,
            valueFormatter: (params) => {
                var date = new Date(params.value)
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
            },
        },
        {
            field: "keterangan",
            headerName: "Keterangan",
            width: 160,
            hide: props.isDashboard,
        },
        {
            field: "report",
            headerName: "Report",
            width: 160,
            hide: props.isDashboard,
            renderCell: (params) => {
                return (
                    <>
                        {params.value === '1' ? (
                            <>Terkirim</>
                        ) : (
                            <>Tidak Terkirim</>
                        )}
                    </>
                );
            },
        },
        {
            field: "report",
            headerName: "Report",
            width: 160,
            hide: props.isDashboard,
        },
        {
            field: "status",
            headerName: "Status",
            width: 140,
            renderCell: (params) => {
                return (
                    <>
                        {params.row.status === 'Selesai' ? (
                            <button className="statusSelesai">{params.row.status}</button>
                        ) : (
                            <button className="statusProses">{params.row.status}</button>
                        )}
                    </>
                );
            },
        },
        {
            field: "action",
            headerName: "Action",
            width: 140,
            renderCell: (params) => {
                return (
                    <>
                        <button disabled={params.row.status === 'Selesai'} onClick={() =>
                            updateStatus(params.row.status, params.row.id, params.row.nama,
                                params.row.handphone, params.row.tgl_masuk)}
                            className="updateStatus">Update Status</button>
                    </>
                );
            },
        },

    ];

    return (
        <>
            <h2>List Customers</h2>
            <div className="list-data">
                <div style={{ height: 300, width: '100%' }}>
                    <DataGrid
                        style={{fontSize:12, borderWidth:"2px", borderColor:"#b6b6b6", borderStyle:'solid'}}
                        rows={data}
                        disableSelectionOnClick
                        columns={columns}
                        pageSize={8}
                    />
                </div>
            </div>
        </>
    );
}


