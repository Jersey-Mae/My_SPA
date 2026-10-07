const express = require('express');
const path = require('path');
const supabase = require('./conn');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home page
app.get('/', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    res.render('index', {
        title: 'Daily Sales Report',
        companyName: 'Imperial Massage and Spa',
        defaultDate: today
    });
});

// Get sales
app.get('/api/sales', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });

    } catch (err) {
        console.error('Error fetching sales:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Add sale
app.post('/api/sales', async (req, res) => {
    try {
        const {
            name,
            service,
            room,
            time,
            total,
            comm,
            report_date
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Staff name is required.'
            });
        }

        const dateVal =
            report_date ||
            new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('sales')
            .insert([
                {
                    name: name,
                    service: service || '',
                    room: room || '',
                    time: time || '',
                    total: total || 0,
                    comm: comm || 0,
                    report_date: dateVal
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });

    } catch (err) {
        console.error('Error adding sale:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Delete sale
app.delete('/api/sales/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            id: id
        });

    } catch (err) {
        console.error('Error deleting sale:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});