import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Thumbnail } from './Thumbnail.js';

describe('Thumbnail', () => {
  it('renders imageUrl as img src', () => {
    const { container } = render(<Thumbnail imageUrl="https://example.com/page1.jpg" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/page1.jpg');
  });

  it('applies imageAlt to img', () => {
    render(<Thumbnail imageUrl="/img.jpg" imageAlt="Page 3" />);
    expect(screen.getByAltText('Page 3')).toBeTruthy();
  });

  it('falls back to empty alt when imageAlt not provided', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('alt')).toBe('');
  });

  it('renders pageNumber when provided', () => {
    render(<Thumbnail imageUrl="/img.jpg" pageNumber="7" />);
    expect(screen.getByText('7')).toBeTruthy();
    const { container } = render(<Thumbnail imageUrl="/img.jpg" pageNumber="42" />);
    expect(container.querySelector('.thumbnail__page-no')).toBeTruthy();
  });

  it('does not render page-no span when pageNumber is not provided', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    expect(container.querySelector('.thumbnail__page-no')).toBeNull();
  });

  it('renders overlayTopLeft in thumbnail__corner--tl', () => {
    const { container } = render(
      <Thumbnail imageUrl="/img.jpg" overlayTopLeft={<span>TL</span>} />,
    );
    const tl = container.querySelector('.thumbnail__corner--tl');
    expect(tl).toBeTruthy();
    expect(tl?.textContent).toBe('TL');
  });

  it('renders overlayTopRight in thumbnail__corner--tr', () => {
    const { container } = render(
      <Thumbnail imageUrl="/img.jpg" overlayTopRight={<span>TR</span>} />,
    );
    const tr = container.querySelector('.thumbnail__corner--tr');
    expect(tr).toBeTruthy();
    expect(tr?.textContent).toBe('TR');
  });

  it('renders overlayBottomLeft in thumbnail__corner--bl', () => {
    const { container } = render(
      <Thumbnail imageUrl="/img.jpg" overlayBottomLeft={<span>BL</span>} />,
    );
    const bl = container.querySelector('.thumbnail__corner--bl');
    expect(bl).toBeTruthy();
    expect(bl?.textContent).toBe('BL');
  });

  it('renders overlayBottomRight in thumbnail__corner--br', () => {
    const { container } = render(
      <Thumbnail imageUrl="/img.jpg" overlayBottomRight={<span>BR</span>} />,
    );
    const br = container.querySelector('.thumbnail__corner--br');
    expect(br).toBeTruthy();
    expect(br?.textContent).toBe('BR');
  });

  it('does not render corner elements when overlay slots absent', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    expect(container.querySelector('.thumbnail__corner')).toBeNull();
  });

  it('renders imageOverlay inside image-wrap', () => {
    const { container } = render(
      <Thumbnail imageUrl="/img.jpg" imageOverlay={<svg data-testid="bbox" />} />,
    );
    const wrap = container.querySelector('.thumbnail__image-wrap');
    const overlay = container.querySelector('.thumbnail__image-overlay');
    expect(overlay).toBeTruthy();
    expect(wrap?.contains(overlay)).toBe(true);
  });

  it('does not render image-overlay div when imageOverlay absent', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    expect(container.querySelector('.thumbnail__image-overlay')).toBeNull();
  });

  it('renders footer below image-wrap when provided', () => {
    const { container } = render(
      <Thumbnail imageUrl="/img.jpg" footer={<div>footer content</div>} />,
    );
    const footer = container.querySelector('.thumbnail__footer');
    expect(footer).toBeTruthy();
    expect(footer?.textContent).toBe('footer content');
    // footer should be after image-wrap as a sibling
    const wrap = container.querySelector('.thumbnail__image-wrap');
    expect(wrap?.nextElementSibling).toBe(footer);
  });

  it('does not render footer div when footer absent', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    expect(container.querySelector('.thumbnail__footer')).toBeNull();
  });

  it('sets data-density attribute from density prop', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" density="s" />);
    const article = container.querySelector('article');
    expect(article?.getAttribute('data-density')).toBe('s');
  });

  it('defaults data-density to m', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    const article = container.querySelector('article');
    expect(article?.getAttribute('data-density')).toBe('m');
  });

  it('sets data-selected when selected is true', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" selected />);
    const article = container.querySelector('article');
    expect(article?.hasAttribute('data-selected')).toBe(true);
  });

  it('does not set data-selected when selected is false', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" selected={false} />);
    const article = container.querySelector('article');
    expect(article?.hasAttribute('data-selected')).toBe(false);
  });

  it('does not set data-selected when selected is absent', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    const article = container.querySelector('article');
    expect(article?.hasAttribute('data-selected')).toBe(false);
  });

  it('wraps image in button when onClick provided', () => {
    const onClick = vi.fn();
    const { container } = render(<Thumbnail imageUrl="/img.jpg" onClick={onClick} />);
    expect(container.querySelector('.thumbnail__image-button')).toBeTruthy();
  });

  it('fires onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Thumbnail imageUrl="/img.jpg" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('sets aria-pressed on button reflecting selected', () => {
    const { container } = render(
      <Thumbnail imageUrl="/img.jpg" onClick={() => undefined} selected />,
    );
    const btn = container.querySelector('.thumbnail__image-button');
    expect(btn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('uses onClickLabel as button aria-label', () => {
    render(<Thumbnail imageUrl="/img.jpg" onClick={() => undefined} onClickLabel="Open page 17" />);
    expect(screen.getByRole('button', { name: 'Open page 17' })).toBeTruthy();
  });

  it('defaults button aria-label to "Open thumbnail"', () => {
    render(<Thumbnail imageUrl="/img.jpg" onClick={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Open thumbnail' })).toBeTruthy();
  });

  it('does not wrap image in button when onClick absent', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    expect(container.querySelector('.thumbnail__image-button')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('renders statusSlot inside thumbnail__status span', () => {
    const { container } = render(
      <Thumbnail imageUrl="/img.jpg" statusSlot={<span data-status="ok" />} />,
    );
    expect(container.querySelector('.thumbnail__status')).toBeTruthy();
  });

  it('does not render status span when statusSlot absent', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    expect(container.querySelector('.thumbnail__status')).toBeNull();
  });

  it('forwards data-testid to article', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" data-testid="thumb-7" />);
    expect(container.querySelector('[data-testid="thumb-7"]')).toBeTruthy();
  });

  it('does not set data-testid attribute when not provided', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    const article = container.querySelector('article');
    expect(article?.hasAttribute('data-testid')).toBe(false);
  });

  it('renders as article element', () => {
    const { container } = render(<Thumbnail imageUrl="/img.jpg" />);
    expect(container.querySelector('article.thumbnail')).toBeTruthy();
  });
});
