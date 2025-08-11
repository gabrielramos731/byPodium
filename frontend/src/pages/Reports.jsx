import React, { useState, useEffect } from 'react';
import api from '../utils/api/Api';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import styles from './Reports.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const Reports = () => {
  const [eventId, setEventId] = useState('');
  const [userEvents, setUserEvents] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedReportSubtype, setSelectedReportSubtype] = useState('summary');

  useEffect(() => {
    fetchUserEvents();
  }, []);

    const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/eventos/organizador/');
      setUserEvents(response.data);
    } catch {
      setError('Erro ao carregar eventos do organizador');
    } finally {
      setLoading(false);
    }
  };

  const generateEventReport = async () => {
    if (!eventId) {
      setError('Selecione um evento');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/eventos/${eventId}/report/?type=${selectedReportSubtype}`);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    generateEventReport();
  };

  const handleSubtypeChange = async (newSubtype) => {
    setSelectedReportSubtype(newSubtype);
    
    // Se já temos dados de relatório carregados, regenerar automaticamente
    if (eventId && reportData) {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/eventos/${eventId}/report/?type=${newSubtype}`);
        setReportData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erro ao gerar relatório');
      } finally {
        setLoading(false);
      }
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let filename = '';

    if (selectedReportSubtype === 'participants') {
      csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Nome,Email,Kit,Status,Data Inscrição\n";
      
      reportData.participantes?.forEach(participant => {
        csvContent += `${participant.nome},${participant.email},${participant.kit},${participant.status},${participant.data_inscricao}\n`;
      });
      
      filename = `participantes_${reportData.evento}.csv`;
    }

    if (csvContent) {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateChartData = () => {
    if (!reportData) return null;

    if (selectedReportSubtype === 'summary') {
      // Gráfico de barras para status das inscrições (em porcentagem)
      const confirmadas = reportData.status_inscricoes?.confirmadas || 0;
      const pendentes = reportData.status_inscricoes?.pendentes || 0;
      const canceladas = reportData.status_inscricoes?.canceladas || 0;
      const total = confirmadas + pendentes + canceladas;
      
      const statusData = {
        labels: ['Confirmadas', 'Pendentes', 'Canceladas'],
        datasets: [{
          label: 'Porcentagem de Inscrições (%)',
          data: [
            total > 0 ? ((confirmadas / total) * 100).toFixed(1) : 0,
            total > 0 ? ((pendentes / total) * 100).toFixed(1) : 0,
            total > 0 ? ((canceladas / total) * 100).toFixed(1) : 0
          ],
          backgroundColor: ['#d9a444', '#f3e96d', '#8c6d34'],
          borderColor: ['#d9a444', '#f3e96d', '#8c6d34'],
          borderWidth: 2
        }]
      };

      // Gráfico de barras para categorias (em porcentagem)
      const categoriaLabels = Object.keys(reportData.categorias || {});
      const categoriaValues = Object.values(reportData.categorias || {});
      const categoriaTotal = categoriaValues.reduce((sum, value) => sum + value, 0);
      
      const categoriaData = {
        labels: categoriaLabels,
        datasets: [{
          label: 'Porcentagem de Inscrições por Categoria (%)',
          data: categoriaValues.map(value => 
            categoriaTotal > 0 ? ((value / categoriaTotal) * 100).toFixed(1) : 0
          ),
          backgroundColor: '#d9a444',
          borderColor: '#f3e96d',
          borderWidth: 2
        }]
      };

      // Gráfico de barras para kits (em porcentagem)
      const kitLabels = Object.keys(reportData.kits || {});
      const kitValues = Object.values(reportData.kits || {});
      const kitTotal = kitValues.reduce((sum, value) => sum + value, 0);
      
      const kitData = {
        labels: kitLabels,
        datasets: [{
          label: 'Porcentagem de Kits Selecionados (%)',
          data: kitValues.map(value => 
            kitTotal > 0 ? ((value / kitTotal) * 100).toFixed(1) : 0
          ),
          backgroundColor: '#f3e96d',
          borderColor: '#d9a444',
          borderWidth: 2
        }]
      };

      // Gráfico de linhas para inscrições por dia
      const inscricoesPorDiaData = reportData.inscricoes_por_dia ? {
        labels: reportData.inscricoes_por_dia.datas.map(data => {
          const date = new Date(data);
          return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        }),
        datasets: [
          {
            label: 'Inscrições Diárias',
            data: reportData.inscricoes_por_dia.inscricoes_diarias,
            borderColor: '#d9a444',
            backgroundColor: 'rgba(217, 164, 68, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0d0d0d',
            pointBorderColor: '#d9a444',
            pointBorderWidth: 2,
            pointRadius: 4
          }
        ]
      } : null;

      return { statusData, categoriaData, kitData, inscricoesPorDiaData };
    }

    return null;
  };

  const chartData = generateChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#0d0d0d',
          font: {
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Dados do Relatório',
        color: '#0d0d0d',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#0d0d0d'
        },
        grid: {
          color: '#444'
        }
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: '#0d0d0d',
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: '#444'
        }
      }
    }
  };

  // Opções específicas para o gráfico de inscrições por dia
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#0d0d0d',
          font: {
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Evolução das Inscrições',
        color: '#0d0d0d',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#0d0d0d'
        },
        grid: {
          color: '#444'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#0d0d0d',
          stepSize: 1
        },
        grid: {
          color: '#444'
        }
      }
    }
  };

  return (
    <div className={styles.reportsContainer}>
      <Navigation />
      
      <div className={styles.header}>
        <h1>Relatórios de Eventos</h1>
        <p>Gere relatórios detalhados dos seus eventos</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.eventSelector}>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className={styles.select}
          >
            <option value="">Selecione um evento</option>
            {userEvents.map(event => (
              <option key={event.id} value={event.id}>
                {event.nome} - {new Date(event.dataIni).toLocaleDateString('pt-BR')}
              </option>
            ))}
          </select>

          <div className={styles.subtypeSelector}>
            <label>
              <input
                type="radio"
                value="summary"
                checked={selectedReportSubtype === 'summary'}
                onChange={(e) => handleSubtypeChange(e.target.value)}
              />
              Resumo do Evento
            </label>
            <label>
              <input
                type="radio"
                value="participants"
                checked={selectedReportSubtype === 'participants'}
                onChange={(e) => handleSubtypeChange(e.target.value)}
              />
              Lista de Participantes
            </label>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className={styles.generateButton}
        >
          {loading ? 'Gerando...' : 'Gerar Relatório'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {reportData && (
        <div className={styles.reportResults}>
          <div className={styles.reportHeader}>
            <h2>
              Relatório: {reportData.evento?.nome || reportData.evento}
            </h2>
            <div className={styles.actions}>
              {selectedReportSubtype === 'participants' ? (
                <button onClick={exportToCSV} className={styles.exportButton}>
                  Exportar CSV
                </button>
              ) : null}
              <span className={styles.generatedAt}>
                Gerado em: {reportData.data_geracao}
              </span>
            </div>
          </div>

          {/* Estatísticas Resumidas */}
          {selectedReportSubtype === 'summary' && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total de Inscritos</h3>
                <p className={styles.statValue}>{reportData.estatisticas?.total_inscritos || 0}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Taxa de Ocupação</h3>
                <p className={styles.statValue}>{(reportData.estatisticas?.taxa_ocupacao || 0).toFixed(1)}%</p>
              </div>
              <div className={styles.statCard}>
                <h3>Vagas Disponíveis</h3>
                <p className={styles.statValue}>{reportData.estatisticas?.vagas_disponiveis || 0}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Capacidade</h3>
                <p className={styles.statValue}>{reportData.evento?.capacidade || 0}</p>
              </div>
            </div>
          )}

          {/* Gráficos */}
          {chartData && (
            <div className={styles.chartsContainer}>
              {selectedReportSubtype === 'summary' && (
                <>
                  {chartData.inscricoesPorDiaData && (
                    <div className={styles.chartCard}>
                      <h3>Evolução das Inscrições</h3>
                      <div className={styles.chartContainer}>
                        <Line data={chartData.inscricoesPorDiaData} options={lineChartOptions} />
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.chartCard}>
                    <h3>Status das Inscrições</h3>
                    <div className={styles.chartContainer}>
                      <Bar data={chartData.statusData} options={chartOptions} />
                    </div>
                  </div>
                  
                  {Object.keys(reportData.categorias || {}).length > 0 && (
                    <div className={styles.chartCard}>
                      <h3>Inscrições por Categoria</h3>
                      <div className={styles.chartContainer}>
                        <Bar data={chartData.categoriaData} options={chartOptions} />
                      </div>
                    </div>
                  )}
                  
                  {Object.keys(reportData.kits || {}).length > 0 && (
                    <div className={styles.chartCard}>
                      <h3>Kits Selecionados</h3>
                      <div className={styles.chartContainer}>
                        <Bar data={chartData.kitData} options={chartOptions} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tabela de Participantes */}
          {selectedReportSubtype === 'participants' && reportData.participantes && (
            <div className={styles.tableCard}>
              <h3>Lista de Participantes</h3>
              <div className={styles.tableContainer}>
                <table className={styles.participantsTable}>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Kit</th>
                      <th>Status</th>
                      <th>Data de Inscrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.participantes.map((participant, index) => (
                      <tr key={index}>
                        <td>{participant.nome}</td>
                        <td>{participant.email}</td>
                        <td>{participant.kit}</td>
                        <td>
                          <span className={`${styles.status} ${styles[participant.status]}`}>
                            {participant.status}
                          </span>
                        </td>
                        <td>{participant.data_inscricao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Reports;
