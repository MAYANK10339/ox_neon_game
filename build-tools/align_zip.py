import struct
import io
import os

def zipalign(input_zip_path, output_zip_path, alignment=4):
    """
    Properly aligns uncompressed entries (like resources.arsc) to 4-byte boundaries.
    Matches standard Android zipalign 4 behavior.
    """
    import zipfile
    
    with zipfile.ZipFile(input_zip_path, 'r') as z_in:
        with open(output_zip_path, 'wb') as f_out:
            central_dir_entries = []
            
            for item in z_in.infolist():
                # Read uncompressed raw data
                raw_data = z_in.read(item.filename)
                
                # Header start offset
                header_offset = f_out.tell()
                
                # Determine compression
                # resources.arsc must be stored uncompressed
                if item.filename == 'resources.arsc':
                    compress_type = 0 # STORED
                    comp_data = raw_data
                else:
                    compress_type = item.compress_type
                    # Compress if not stored
                    if compress_type != 0:
                        import zlib
                        comp_data = zlib.compress(raw_data)[2:-4] # raw deflate
                    else:
                        comp_data = raw_data
                
                fname_bytes = item.filename.encode('utf-8')
                extra = bytearray(item.extra)
                
                # Calculate alignment for uncompressed entries
                if compress_type == 0:
                    current_data_offset = header_offset + 30 + len(fname_bytes) + len(extra)
                    padding = (alignment - (current_data_offset % alignment)) % alignment
                    if padding > 0:
                        extra.extend(b'\x00' * padding)
                
                # Write Local File Header
                crc = z_in.getinfo(item.filename).CRC
                comp_size = len(comp_data)
                uncomp_size = len(raw_data)
                
                local_header = struct.pack(
                    '<IHHHHHIIIHH',
                    0x04034b50,       # Signature
                    item.extract_version or 20,
                    item.flag_bits,
                    compress_type,
                    item.date_time[3] << 11 | item.date_time[4] << 5 | item.date_time[5] // 2,
                    (item.date_time[0] - 1980) << 9 | item.date_time[1] << 5 | item.date_time[2],
                    crc,
                    comp_size,
                    uncomp_size,
                    len(fname_bytes),
                    len(extra)
                )
                
                f_out.write(local_header)
                f_out.write(fname_bytes)
                f_out.write(extra)
                
                # Verify data alignment
                data_offset = f_out.tell()
                if compress_type == 0:
                    assert data_offset % alignment == 0, f"Offset {data_offset} not aligned to {alignment}!"
                
                f_out.write(comp_data)
                
                # Save entry for Central Directory
                central_dir_entries.append((item, fname_bytes, extra, header_offset, crc, comp_size, uncomp_size, compress_type))
            
            # Write Central Directory
            cd_start_offset = f_out.tell()
            for item, fname_bytes, extra, header_offset, crc, comp_size, uncomp_size, compress_type in central_dir_entries:
                cd_header = struct.pack(
                    '<IHHHHHHIIIHHHHHII',
                    0x02014b50,       # Central directory signature
                    item.create_version or 0x0314,
                    item.extract_version or 20,
                    item.flag_bits,
                    compress_type,
                    item.date_time[3] << 11 | item.date_time[4] << 5 | item.date_time[5] // 2,
                    (item.date_time[0] - 1980) << 9 | item.date_time[1] << 5 | item.date_time[2],
                    crc,
                    comp_size,
                    uncomp_size,
                    len(fname_bytes),
                    len(item.extra),  # CD keeps original extra
                    len(item.comment.encode('utf-8') if item.comment else b''),
                    0,                # disk number start
                    item.internal_attr,
                    item.external_attr,
                    header_offset
                )
                f_out.write(cd_header)
                f_out.write(fname_bytes)
                f_out.write(item.extra)
                if item.comment:
                    f_out.write(item.comment.encode('utf-8'))
            
            cd_end_offset = f_out.tell()
            cd_size = cd_end_offset - cd_start_offset
            
            # End of Central Directory Record
            eocd = struct.pack(
                '<IHHHHIIH',
                0x06054b50,
                0,
                0,
                len(central_dir_entries),
                len(central_dir_entries),
                cd_size,
                cd_start_offset,
                0
            )
            f_out.write(eocd)

print("zipalign module defined.")
