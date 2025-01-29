document.addEventListener('DOMContentLoaded', () => {
    const lancarButton = document.querySelector('.Lancamento-Geral button');
    const tableBody = document.querySelector('.Lancamento-Geral tbody');
    const relatorioRows = document.querySelectorAll('.Relatorio-2025 tbody tr');
    const caixaAnoElement = document.querySelector('.Retangulo-Caixa .content p');
    const vendasAnoElement = document.querySelector('.Retangulo-Vendas .content p');
    const gastosAnoElement = document.querySelector('.Retangulo-Gastos .content p');

    lancarButton.addEventListener('click', () => {
        let data = document.querySelector('input[placeholder="Data"]').value;
        let tipo = document.querySelector('select[placeholder="Tipo"]').value;
        let descricao = document.querySelector('input[placeholder="Descrição"]').value;
        let qtd = document.querySelector('input[placeholder="Qtd"]').value;
        let valor = document.querySelector('input[placeholder="Valor"]').value;

        // Set default values if inputs are empty
        if (!data) {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            data = `${year}-${month}-${day}`;
        }
        if (!tipo) tipo = 'Sem';
        if (!descricao) descricao = 'Sem Descrição';
        if (!qtd) qtd = '0';
        if (!valor) valor = '0';

        // Convert date to Brazilian format
        const [year, month, day] = data.split('-');
        const formattedDate = `${day}/${month}/${year}`;

        // Convert value to Brazilian Real currency
        const formattedValue = `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;

        // Limit description to 20 characters
        if (descricao.length > 20) {
            descricao = descricao.substring(0, 20) + '...';
        }

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${formattedDate}</td>
            <td>${tipo}</td>
            <td>${descricao}</td>
            <td>${qtd}</td>
            <td>${formattedValue}</td>
            <td class="action-icons">
                <img src="icons/edit.svg" alt="Editar" class="edit-icon">
                <img src="icons/delete.svg" alt="Excluir" class="delete-icon">
            </td>
        `;

        tableBody.insertBefore(newRow, tableBody.firstChild);

        // Clear the input fields
        document.querySelector('input[placeholder="Data"]').value = '';
        document.querySelector('select[placeholder="Tipo"]').value = '';
        document.querySelector('input[placeholder="Descrição"]').value = '';
        document.querySelector('input[placeholder="Qtd"]').value = '';
        document.querySelector('input[placeholder="Valor"]').value = '';

        // Add event listeners for the new icons
        addEventListeners(newRow);

        // Sync with localStorage
        syncLocalStorage();

        // Update the "Relatório" table
        updateRelatorio();
    });

    function addEventListeners(row) {
        const editIcon = row.querySelector('.edit-icon');
        const deleteIcon = row.querySelector('.delete-icon');

        editIcon.addEventListener('click', () => {
            const cells = row.querySelectorAll('td');
            document.querySelector('input[placeholder="Data"]').value = cells[0].innerText.split('/').reverse().join('-');
            document.querySelector('select[placeholder="Tipo"]').value = cells[1].innerText;
            document.querySelector('input[placeholder="Descrição"]').value = cells[2].innerText.replace('...', '');
            document.querySelector('input[placeholder="Qtd"]').value = cells[3].innerText;
            document.querySelector('input[placeholder="Valor"]').value = cells[4].innerText.replace('R$ ', '').replace(',', '.');
            row.remove();
            syncLocalStorage();
            updateRelatorio();
        });

        deleteIcon.addEventListener('click', () => {
            row.remove();
            syncLocalStorage();
            updateRelatorio();
        });
    }

    function syncLocalStorage() {
        const rows = Array.from(tableBody.querySelectorAll('tr')).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                data: cells[0].innerText,
                tipo: cells[1].innerText,
                descricao: cells[2].innerText,
                qtd: cells[3].innerText,
                valor: cells[4].innerText
            };
        });
        localStorage.setItem('tableData', JSON.stringify(rows));
    }

    function updateRelatorio() {
        const rows = JSON.parse(localStorage.getItem('tableData')) || [];
        const monthlyData = {};

        // Initialize monthly data
        relatorioRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const month = cells[0].innerText;
            monthlyData[month] = {
                vendas: 0,
                gastos: 0,
                investimento: 0
            };
        });

        // Aggregate data by month
        rows.forEach(row => {
            const [day, month, year] = row.data.split('/');
            const monthName = getMonthName(parseInt(month, 10));
            if (monthlyData[monthName]) {
                if (row.tipo === 'Venda') {
                    monthlyData[monthName].vendas += parseFloat(row.valor.replace('R$ ', '').replace(',', '.'));
                } else if (row.tipo === 'Compra') {
                    monthlyData[monthName].gastos += parseFloat(row.valor.replace('R$ ', '').replace(',', '.'));
                } else if (row.tipo === 'Investimento') {
                    monthlyData[monthName].investimento += parseFloat(row.valor.replace('R$ ', '').replace(',', '.'));
                }
            }
        });

        let totalCaixaAno = 0;
        let totalVendasAno = 0;
        let totalGastosAno = 0;

        // Update the "Relatório" table
        relatorioRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const month = cells[0].innerText;
            if (monthlyData[month]) {
                const totalCaixa = monthlyData[month].vendas + monthlyData[month].investimento - monthlyData[month].gastos;
                cells[1].innerText = `R$ ${monthlyData[month].vendas.toFixed(2).replace('.', ',')}`;
                cells[2].innerText = `R$ ${monthlyData[month].gastos.toFixed(2).replace('.', ',')}`;
                cells[3].innerText = `R$ ${monthlyData[month].investimento.toFixed(2).replace('.', ',')}`;
                cells[4].innerText = `R$ ${totalCaixa.toFixed(2).replace('.', ',')}`;
                totalCaixaAno += totalCaixa;
                totalVendasAno += monthlyData[month].vendas;
                totalGastosAno += monthlyData[month].gastos;
            }
        });

        // Update the "Caixa | ano", "Vendas | ano", and "Gastos | ano" sections
        caixaAnoElement.innerText = `R$ ${totalCaixaAno.toFixed(2).replace('.', ',')}`;
        vendasAnoElement.innerText = `R$ ${totalVendasAno.toFixed(2).replace('.', ',')}`;
        gastosAnoElement.innerText = `R$ ${totalGastosAno.toFixed(2).replace('.', ',')}`;
    }

    function getMonthName(monthIndex) {
        const monthNames = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return monthNames[monthIndex - 1];
    }

    // Add event listeners for existing rows
    document.querySelectorAll('.Lancamento-Geral tbody tr').forEach(addEventListeners);

    // Load initial data from localStorage
    const initialRows = JSON.parse(localStorage.getItem('tableData')) || [];
    initialRows.forEach(rowData => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${rowData.data}</td>
            <td>${rowData.tipo}</td>
            <td>${rowData.descricao}</td>
            <td>${rowData.qtd}</td>
            <td>${rowData.valor}</td>
            <td class="action-icons">
                <img src="icons/edit.svg" alt="Editar" class="edit-icon">
                <img src="icons/delete.svg" alt="Excluir" class="delete-icon">
            </td>
        `;
        tableBody.appendChild(newRow);
        addEventListeners(newRow);
    });

    // Initial update of the "Relatório" table
    updateRelatorio();
});
