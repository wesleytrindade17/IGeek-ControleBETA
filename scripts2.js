document.addEventListener('DOMContentLoaded', () => {
    const lancarButton = document.querySelector('.Lancamento-Geral button');
    const tableBody = document.querySelector('.Lancamento-Geral tbody');

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
        });

        deleteIcon.addEventListener('click', () => {
            row.remove();
        });
    }

    // Add event listeners for existing rows
    document.querySelectorAll('.Lancamento-Geral tbody tr').forEach(addEventListeners);

    function updateTable() {
        const rows = JSON.parse(localStorage.getItem('tableData')) || [];
        tableBody.innerHTML = '';
        rows.forEach(rowData => {
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
        });
    }

    // Initial table update
    updateTable();

    // Listen for storage events to update the table
    window.addEventListener('storage', updateTable);
});
