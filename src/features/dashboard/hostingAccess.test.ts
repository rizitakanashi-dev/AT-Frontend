import { describe, expect, it } from 'vitest';
import { hostingPermissions, safeHostingUrl } from './hostingAccess';
import type { HostingRequestDTO, HostingStatusValue } from '@/types/hosting';

const request: HostingRequestDTO = { id: 1, idUser: 7, idProject: 3, projectName: 'Proyek', userName: 'Pelajar', contactName: 'Kontak', contactEmail: 'test@example.com', contactPhone: '0800000000', status: 'pending', idDevOpsHandler: 9, createdAt: '', updatedAt: '' };
const user = (role: string, id = 7) => ({ id, role });

describe('Izin hosting frontend', () => {
  it.each(['pending', 'rejected', 'cancelled'] as HostingStatusValue[])('DevOps tidak menampilkan %s', (status) => {
    const permissions = hostingPermissions(user('DevOps', 9), { ...request, status });
    expect(Object.values(permissions).every((allowed) => !allowed)).toBe(true);
  });
  it.each(['approved', 'in_progress', 'completed'] as HostingStatusValue[])('DevOps dapat melihat %s', (status) => {
    expect(hostingPermissions(user('DevOps', 9), { ...request, status }).view).toBe(true);
  });
  it('PM meninjau pending, tetapi tidak melakukan deployment', () => {
    expect(hostingPermissions(user('PM'), request).review).toBe(true);
    expect(hostingPermissions(user('PM'), { ...request, status: 'approved' }).start).toBe(false);
    expect(hostingPermissions(user('PM'), { ...request, status: 'rejected' }).review).toBe(false);
  });
  it('anggota dan alias Pelajar hanya mengakses permintaan sendiri', () => {
    for (const role of ['Anggota', 'Pelajar']) {
      expect(hostingPermissions(user(role), request).edit).toBe(true);
      expect(hostingPermissions(user(role, 8), request).view).toBe(false);
      expect(hostingPermissions(user(role), { ...request, status: 'approved' }).edit).toBe(false);
    }
  });
  it('penyelesaian dan catatan DevOps hanya oleh handler atau Admin', () => {
    const active = { ...request, status: 'in_progress' as const };
    expect(hostingPermissions(user('DevOps', 9), active).complete).toBe(true);
    expect(hostingPermissions(user('DevOps', 10), active).complete).toBe(false);
    expect(hostingPermissions(user('DevOps', 10), active).notes).toBe(false);
    expect(hostingPermissions(user('Admin'), active).complete).toBe(true);
  });
  it('admin melihat semua status dan bisa mengelola pengajuan milik anggota', () => {
    for (const status of ['pending', 'rejected', 'cancelled', 'approved', 'in_progress', 'completed'] as HostingStatusValue[]) {
      expect(hostingPermissions(user('Admin', 1), { ...request, status }).delete).toBe(true);
    }
    expect(hostingPermissions(user('Admin', 1), request).edit).toBe(true);
  });
  it('pengajuan ulang hanya untuk pemilik request ditolak', () => {
    expect(hostingPermissions(user('Anggota'), { ...request, status: 'rejected' }).resubmit).toBe(true);
    expect(hostingPermissions(user('PM'), { ...request, status: 'rejected' }).resubmit).toBe(false);
  });
  it('menolak akun tidak dikenal, Guru, atau tanpa profil', () => {
    expect(hostingPermissions(undefined, request).view).toBe(false);
    expect(hostingPermissions(user('Unknown'), request).view).toBe(false);
    expect(hostingPermissions(user('Guru'), request).view).toBe(false);
  });
});

describe('Tautan hosting aman', () => {
  it.each(['javascript:alert(1)', 'data:text/html,test', 'ftp://example.com', '/relative', 'https://user:password@example.com', 'not a url', ''])('menolak %s', (value) => expect(safeHostingUrl(value)).toBeUndefined());
  it('menerima HTTP dan HTTPS', () => {
    expect(safeHostingUrl(' https://example.com/app ')).toBe('https://example.com/app');
    expect(safeHostingUrl('http://example.com')).toBe('http://example.com/');
  });
});
