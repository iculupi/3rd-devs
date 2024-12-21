```sql
SELECT d.dc_id 
FROM datacenters d 
JOIN users u ON d.manager = u.id 
WHERE d.is_active = 1 AND u.is_active = 0;
```